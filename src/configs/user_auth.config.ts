import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserAuthConfig {
  @IsNotEmpty()
  @IsString()
  accessTokenSecret: string;

  @IsNotEmpty()
  @IsNumber()
  accessTokenLifetime: number;

  @IsNotEmpty()
  @IsString()
  refreshTokenSecret: string;

  @IsNotEmpty()
  @IsNumber()
  refreshTokenLifetime: number;

  constructor() {
    this.accessTokenSecret = process.env.USER_ACCESS_TOKEN_SECRET;
    this.accessTokenLifetime = Number(process.env.USER_ACCESS_TOKEN_LIFETIME);
    this.refreshTokenSecret = process.env.USER_REFRESH_TOKEN_SECRET;
    this.refreshTokenLifetime = Number(process.env.USER_REFRESH_TOKEN_LIFETIME);
  }
}

export default registerAs<UserAuthConfig>(
  'userAuth',
  () => new UserAuthConfig(),
);
