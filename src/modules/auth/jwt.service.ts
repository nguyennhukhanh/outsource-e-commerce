import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StellaConfig } from 'src/configs';
import type { JwtPayloadType, TokensType } from 'src/shared/types';

type AuthConfig = {
  accessTokenSecret: string;
  accessTokenLifetime: number;
  refreshTokenSecret: string;
  refreshTokenLifetime: number;
};

@Injectable()
export class MyJwtService {
  constructor(
    private readonly configService: ConfigService<StellaConfig>,
    private readonly jwtService: JwtService,
  ) {}

  private async signTokens(
    payload: { session: string },
    configKey: 'adminAuth' | 'userAuth',
  ): Promise<TokensType> {
    const config = this.configService.get<AuthConfig>(configKey, {
      infer: true,
    });

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: config.accessTokenLifetime,
        secret: config.accessTokenSecret,
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: config.refreshTokenLifetime,
        secret: config.refreshTokenSecret,
      }),
    ]);

    const expiresAt = Math.floor(
      Date.now() + config.accessTokenLifetime * 1000,
    );

    return { accessToken, refreshToken, expiresAt };
  }

  private async decodeToken(
    token: string,
    configKey: 'adminAuth' | 'userAuth',
  ): Promise<string> {
    const config = this.configService.get<AuthConfig>(configKey);
    const data = await this.jwtService.verifyAsync<JwtPayloadType>(token, {
      secret: config.accessTokenSecret,
    });
    return data.session;
  }

  async signAdminTokens(payload: { session: string }): Promise<TokensType> {
    return this.signTokens(payload, 'adminAuth');
  }

  async signUserTokens(payload: { session: string }): Promise<TokensType> {
    return this.signTokens(payload, 'userAuth');
  }

  async decodeAccessTokenForAdmin(token: string): Promise<string> {
    return this.decodeToken(token, 'adminAuth');
  }

  async decodeAccessTokenForUser(token: string): Promise<string> {
    return this.decodeToken(token, 'userAuth');
  }
}
