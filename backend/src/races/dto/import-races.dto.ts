import { Type } from 'class-transformer';
import {
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  Min,
  Max,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class ImportRaceItemDto {
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

  @IsDateString()
  @IsOptional()
  date?: string; // Original date from local storage
}

export class ImportRacesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportRaceItemDto)
  races: ImportRaceItemDto[];
}
