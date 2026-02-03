import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Race } from './entities/race.entity';
import { CreateRaceDto } from './dto/create-race.dto';
import { ImportRaceItemDto } from './dto/import-races.dto';

@Injectable()
export class RacesService {
  constructor(
    @InjectRepository(Race)
    private racesRepository: Repository<Race>,
  ) {}

  async create(userId: string, createRaceDto: CreateRaceDto): Promise<Race> {
    const race = this.racesRepository.create({
      ...createRaceDto,
      userId,
      quoteSource: createRaceDto.quoteSource || '',
      pokemonName: createRaceDto.pokemonName || '',
    });
    return this.racesRepository.save(race);
  }

  async importRaces(
    userId: string,
    races: ImportRaceItemDto[],
  ): Promise<{ imported: number }> {
    const raceEntities = races.map((race) => {
      const entity = this.racesRepository.create({
        quoteId: race.quoteId,
        quoteSource: race.quoteSource || '',
        wpm: race.wpm,
        accuracy: race.accuracy,
        timeSeconds: race.timeSeconds,
        errors: race.errors,
        pokemonName: race.pokemonName || '',
        userId,
      });
      // Preserve original date if provided
      if (race.date) {
        entity.createdAt = new Date(race.date);
      }
      return entity;
    });

    await this.racesRepository.save(raceEntities);
    return { imported: raceEntities.length };
  }

  async findByUserId(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ data: Race[]; total: number }> {
    const [data, total] = await this.racesRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    return { data, total };
  }

  async findById(id: string): Promise<Race | null> {
    return this.racesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async getUserStats(userId: string) {
    const races = await this.racesRepository.find({ where: { userId } });

    if (races.length === 0) {
      return {
        totalRaces: 0,
        totalTimeSpent: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        bestAccuracy: 0,
        pokemonCaught: [],
      };
    }

    const totalWpm = races.reduce((sum, r) => sum + r.wpm, 0);
    const totalAccuracy = races.reduce((sum, r) => sum + r.accuracy, 0);
    const totalTime = races.reduce((sum, r) => sum + r.timeSeconds, 0);
    const pokemonCaught = [...new Set(races.map((r) => r.pokemonName).filter(Boolean))];

    return {
      totalRaces: races.length,
      totalTimeSpent: totalTime,
      averageWpm: Math.round(totalWpm / races.length),
      averageAccuracy: Math.round((totalAccuracy / races.length) * 10) / 10,
      bestWpm: Math.max(...races.map((r) => r.wpm)),
      bestAccuracy: Math.max(...races.map((r) => r.accuracy)),
      pokemonCaught,
    };
  }
}
