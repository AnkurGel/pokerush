import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RacesModule } from './races/races.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'pokerush.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create tables in dev
    }),
    AuthModule,
    UsersModule,
    RacesModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
