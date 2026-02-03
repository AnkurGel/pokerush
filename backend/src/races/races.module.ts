import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';
import { Race } from './entities/race.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Race])],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [RacesService],
})
export class RacesModule {}
