import { Injectable } from '@nestjs/common';
import { SocialAuthEnum } from 'src/shared/enums';
import type { ISocialAuth } from 'src/shared/interfaces/social_auth.interface';

import { GoogleAuthService } from './google_auth.service';

type AuthType = 'admin' | 'user';
type AuthServiceMap = Record<
  AuthType,
  Partial<Record<SocialAuthEnum, ISocialAuth>>
>;

@Injectable()
export class AuthFactory {
  private readonly socialAuthServices: AuthServiceMap;

  constructor(googleAuthService: GoogleAuthService) {
    this.socialAuthServices = {
      admin: { [SocialAuthEnum.GOOGLE]: googleAuthService },
      user: { [SocialAuthEnum.GOOGLE]: googleAuthService },
    };
  }

  getSocialAuthService(type: AuthType, provider: SocialAuthEnum): ISocialAuth {
    const service = this.socialAuthServices[type]?.[provider];
    if (!service) {
      throw new Error(
        `Unsupported auth provider: ${provider} for type: ${type}`,
      );
    }
    return service;
  }
}
