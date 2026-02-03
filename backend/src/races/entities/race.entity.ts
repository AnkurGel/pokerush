import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('races')
export class Race {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quoteId: number;

  @Column()
  quoteSource: string;

  @Column()
  wpm: number;

  @Column('float')
  accuracy: number;

  @Column('float')
  timeSeconds: number;

  @Column()
  errors: number;

  @Column()
  pokemonName: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.races, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  @Index()
  userId: string;
}
