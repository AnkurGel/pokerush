import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Race } from '../races/entities/race.entity';
import { User } from '../users/entities/user.entity';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  wpm: number;
  accuracy: number;
  quoteId?: number;
  quoteSource?: string;
  date: Date;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(Race)
    private racesRepository: Repository<Race>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getGlobalLeaderboard(
    limit = 50,
    quoteId?: number,
    period?: 'weekly' | 'monthly' | 'alltime',
  ): Promise<LeaderboardEntry[]> {
    // Build date filter
    let dateFilter: Date | undefined;
    if (period === 'weekly') {
      dateFilter = new Date();
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === 'monthly') {
      dateFilter = new Date();
      dateFilter.setMonth(dateFilter.getMonth() - 1);
    }

    // Build query
    const queryBuilder = this.racesRepository
      .createQueryBuilder('race')
      .leftJoin('race.user', 'user')
      .select([
        'race.userId',
        'user.displayName',
        'race.wpm',
        'race.accuracy',
        'race.quoteId',
        'race.quoteSource',
        'race.createdAt',
      ]);

    if (quoteId) {
      queryBuilder.where('race.quoteId = :quoteId', { quoteId });
    }

    if (dateFilter) {
      queryBuilder.andWhere('race.createdAt > :dateFilter', { dateFilter });
    }

    queryBuilder.orderBy('race.wpm', 'DESC').limit(limit);

    const races = await queryBuilder.getRawMany();

    // Transform to leaderboard entries
    return races.map((race, index) => ({
      rank: index + 1,
      userId: race.race_userId,
      displayName: race.user_displayName || 'Anonymous',
      wpm: race.race_wpm,
      accuracy: race.race_accuracy,
      quoteId: race.race_quoteId,
      quoteSource: race.race_quoteSource,
      date: race.race_createdAt,
    }));
  }

  async getUserRank(userId: string, quoteId?: number): Promise<number | null> {
    // Get user's best WPM
    const queryBuilder = this.racesRepository
      .createQueryBuilder('race')
      .where('race.userId = :userId', { userId });

    if (quoteId) {
      queryBuilder.andWhere('race.quoteId = :quoteId', { quoteId });
    }

    queryBuilder.orderBy('race.wpm', 'DESC').limit(1);

    const userBest = await queryBuilder.getOne();
    if (!userBest) return null;

    // Count how many users have a better WPM
    const countQueryBuilder = this.racesRepository
      .createQueryBuilder('race')
      .select('COUNT(DISTINCT race.userId)', 'count')
      .where('race.wpm > :wpm', { wpm: userBest.wpm });

    if (quoteId) {
      countQueryBuilder.andWhere('race.quoteId = :quoteId', { quoteId });
    }

    const result = await countQueryBuilder.getRawOne();
    return parseInt(result.count, 10) + 1;
  }

  async getTopByQuote(quoteId: number, limit = 10): Promise<LeaderboardEntry[]> {
    return this.getGlobalLeaderboard(limit, quoteId);
  }
}
