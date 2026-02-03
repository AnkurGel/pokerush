import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    email: string,
    password: string,
    displayName: string,
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      email,
      passwordHash,
      displayName,
    });
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  async updateDisplayName(userId: string, displayName: string): Promise<User> {
    await this.usersRepository.update(userId, { displayName });
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async getPublicProfile(userId: string) {
    const user = await this.findById(userId);
    if (!user) return null;
    return {
      id: user.id,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  }
}
