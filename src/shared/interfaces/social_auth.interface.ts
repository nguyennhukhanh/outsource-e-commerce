import type { Admin, User } from 'src/database/entities';
import type { ValidateByGoogleDto } from 'src/modules/auth/dto/admin_social.validate';

import type { TokensType } from '../types';

export interface ISocialAuth {
  createAdminSession(
    input: ValidateByGoogleDto,
  ): Promise<{ admin: Admin; tokens: TokensType }>;

  createUserSession(
    input: ValidateByGoogleDto,
  ): Promise<{ user: User; tokens: TokensType }>;
}
