import {
  IsNumber,
  IsString,
  Min,
  Max,
  IsOptional,
} from 'class-validator';

export class CreateRaceDto {
  @IsNumber()
  quoteId: number;

  @IsString()
  @IsOptional()
  quoteSource?: string;

  @IsNumber()
  @Min(0)
  @Max(500)
  wpm: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy: number;

  @IsNumber()
  @Min(0)
  timeSeconds: number;

  @IsNumber()
  @Min(0)
  errors: number;

  @IsString()
  @IsOptional()
  pokemonName?: string;
}
