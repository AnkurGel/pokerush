import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { RacesService } from './races.service';
import { CreateRaceDto } from './dto/create-race.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('races')
@UseGuards(JwtAuthGuard)
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createRaceDto: CreateRaceDto,
  ) {
    const race = await this.racesService.create(user.id, createRaceDto);
    return {
      id: race.id,
      quoteId: race.quoteId,
      quoteSource: race.quoteSource,
      wpm: race.wpm,
      accuracy: race.accuracy,
      timeSeconds: race.timeSeconds,
      errors: race.errors,
      pokemonName: race.pokemonName,
      createdAt: race.createdAt,
    };
  }

  @Get()
  async findAll(
    @CurrentUser() user: User,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    return this.racesService.findByUserId(user.id, parsedLimit, parsedOffset);
  }

  @Get('stats')
  async getStats(@CurrentUser() user: User) {
    return this.racesService.getUserStats(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    const race = await this.racesService.findById(id);
    if (!race || race.userId !== user.id) {
      throw new NotFoundException('Race not found');
    }
    return race;
  }
}
