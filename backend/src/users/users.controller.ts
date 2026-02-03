import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    const profile = await this.usersService.getPublicProfile(id);
    if (!profile) {
      throw new NotFoundException('User not found');
    }
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(
    @CurrentUser() user: User,
    @Body('displayName') displayName: string,
  ) {
    const updated = await this.usersService.updateDisplayName(
      user.id,
      displayName,
    );
    return {
      id: updated.id,
      email: updated.email,
      displayName: updated.displayName,
      createdAt: updated.createdAt,
    };
  }
}
