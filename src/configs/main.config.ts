import { registerAs } from '@nestjs/config';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MainConfig {
  @IsNotEmpty()
  @IsNumber()
  port: number;

  @IsNotEmpty()
  @IsBoolean()
  isProduction: boolean;

  @IsNotEmpty()
  @IsString()
  apiPrefix: string;

  @IsOptional()
  @IsString()
  whitelist?: string;

  @IsOptional()
  @IsString()
  workingDirectory?: string;

  @IsOptional()
  @IsArray()
  cronJobs?: string[];

  @IsNotEmpty()
  @IsString()
  tmdbApiKey: string;

  constructor() {
    this.port = Number(process.env.PORT);
    this.isProduction = process.env.PRODUCTION === 'true';
    this.apiPrefix = process.env.API_PREFIX || 'api';
    this.whitelist = process.env.WHITELIST;
    this.workingDirectory = process.cwd();
    this.cronJobs = process.env.CRON_JOBS?.split(',') || [
      '0 0 * * *',
      '0 1 * * *',
    ]; // Default cron jobs at 0:00 AM and 1:00 AM
    this.tmdbApiKey = process.env.TMDB_API_KEY;
  }
}

export default registerAs<MainConfig>('main', () => new MainConfig());
