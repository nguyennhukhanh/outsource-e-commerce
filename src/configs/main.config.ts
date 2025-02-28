import { registerAs } from '@nestjs/config';
import {
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

  constructor() {
    this.port = Number(process.env.PORT);
    this.isProduction = process.env.PRODUCTION === 'true';
    this.apiPrefix = process.env.API_PREFIX || 'api';
    this.whitelist = process.env.WHITELIST;
    this.workingDirectory = process.cwd();
  }
}

export default registerAs<MainConfig>('main', () => new MainConfig());
