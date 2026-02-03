import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getGlobalLeaderboard(
    @Query('limit') limit?: string,
    @Query('quote') quoteId?: string,
    @Query('period') period?: 'weekly' | 'monthly' | 'alltime',
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedQuoteId = quoteId ? parseInt(quoteId, 10) : undefined;
    return this.leaderboardService.getGlobalLeaderboard(
      parsedLimit,
      parsedQuoteId,
      period || 'alltime',
    );
  }

  @Get('user/:userId')
  async getUserRank(
    @Param('userId') userId: string,
    @Query('quote') quoteId?: string,
  ) {
    const parsedQuoteId = quoteId ? parseInt(quoteId, 10) : undefined;
    const rank = await this.leaderboardService.getUserRank(
      userId,
      parsedQuoteId,
    );
    return { userId, rank };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyRank(
    @CurrentUser() user: User,
    @Query('quote') quoteId?: string,
  ) {
    const parsedQuoteId = quoteId ? parseInt(quoteId, 10) : undefined;
    const rank = await this.leaderboardService.getUserRank(
      user.id,
      parsedQuoteId,
    );
    return { userId: user.id, rank };
  }

  @Get('quote/:quoteId')
  async getQuoteLeaderboard(
    @Param('quoteId') quoteId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedQuoteId = parseInt(quoteId, 10);
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.leaderboardService.getTopByQuote(parsedQuoteId, parsedLimit);
  }
}
