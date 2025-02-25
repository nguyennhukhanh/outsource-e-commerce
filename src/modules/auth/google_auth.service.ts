import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, firstValueFrom } from 'rxjs';
import { Causes } from 'src/common/exceptions/causes';
import { Admin, User } from 'src/database/entities';
import type { ISocial } from 'src/shared/interfaces/social.interface';
import type { ISocialAuth } from 'src/shared/interfaces/social_auth.interface';
import type { TokensType } from 'src/shared/types';
import { getLogger } from 'src/utils/logger';
import { Repository } from 'typeorm';

import { AuthHelperService } from './auth_helper.service';
import type { ValidateByGoogleDto } from './dto/admin_social.validate';

const logger = getLogger('GoogleAuthService');

@Injectable()
export class GoogleAuthService implements ISocialAuth {
  private readonly GOOGLE_USER_INFO_URL =
    'https://www.googleapis.com/oauth2/v1/userinfo';

  constructor(
    private readonly httpService: HttpService,
    private readonly authHelperService: AuthHelperService,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  private async getProfileByToken(accessToken: string): Promise<ISocial> {
    try {
      const { data } = await firstValueFrom(
        this.httpService
          .get<any>(
            `${this.GOOGLE_USER_INFO_URL}?alt=json&access_token=${accessToken}`,
          )
          .pipe(
            catchError((error) => {
              logger.error(error.response?.data?.error?.status);
              throw error.response?.data?.error || error;
            }),
          ),
      );

      return {
        id: data.id,
        email: data.email,
        firstName: data.given_name,
        lastName: data.family_name,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private async validateSocialAdmin(socialData: ISocial): Promise<Admin> {
    let admin: Admin = null;
    const { id, email } = socialData;

    admin = await this.adminRepository.findOne({
      where: {
        email,
      },
    });

    if (!admin) {
      throw Causes.FORBIDDEN(
        'Email',
        'Access Denied! Your email address is not authorized to access this site!',
      );
    } else {
      if (!admin.isActive) {
        throw Causes.FORBIDDEN('Admin', 'Admin is not active!');
      }

      if (!admin.socialId) {
        await this.adminRepository.update(admin.id, {
          socialId: id,
        });
      }
    }

    return admin;
  }

  async createAdminSession(
    input: ValidateByGoogleDto,
  ): Promise<{ admin: Admin; tokens: TokensType }> {
    const socialData = await this.getProfileByToken(input.accessToken);
    const admin = await this.validateSocialAdmin(socialData);
    const tokens = await this.authHelperService.createTokensAsAdmin(admin);

    return {
      admin,
      tokens,
    };
  }

  private async validateOrCreateSocialUser(socialData: ISocial): Promise<User> {
    const { id, email, firstName, lastName } = socialData;
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = await this.userRepository.save(
        this.userRepository.create({
          email,
          fullName: `${firstName} ${lastName}`,
          socialId: id,
          isActive: true,
        }),
      );
    } else {
      if (!user.isActive) {
        throw Causes.FORBIDDEN('User', 'User is not active!');
      }
      if (!user.socialId) {
        await this.userRepository.update(user.id, { socialId: id });
      }
    }

    return user;
  }

  async createUserSession(
    dto: ValidateByGoogleDto,
  ): Promise<{ user: User; tokens: TokensType }> {
    const socialData = await this.getProfileByToken(dto.accessToken);
    const user = await this.validateOrCreateSocialUser(socialData);
    const tokens = await this.authHelperService.createTokensAsUser(user);

    return {
      user,
      tokens,
    };
  }
}
