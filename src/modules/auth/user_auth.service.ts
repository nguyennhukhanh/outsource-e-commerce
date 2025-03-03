import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Causes } from 'src/common/exceptions/causes';
import { User } from 'src/database/entities';
import { SocialAuthEnum } from 'src/shared/enums';
import type { TokensType } from 'src/shared/types';
import { Repository } from 'typeorm';

import { AuthHelperService } from './auth_helper.service';
import type { UserCreateDto } from './dto/user.create';
import type { UserValidateDto } from './dto/user.validate';
import { HashService } from './hash.service';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly authHelperService: AuthHelperService,
  ) {}

  async register(
    dto: UserCreateDto,
  ): Promise<{ user: User; tokens: TokensType }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.hashService.hash(dto.password);

    // Create the user
    const user = await this.userRepository.save(
      this.userRepository.create({
        email: dto.email,
        fullName: dto.fullName,
        password: hashedPassword,
        socialType: SocialAuthEnum.GOOGLE,
        isActive: true,
      }),
    );

    // Generate tokens
    const tokens = await this.authHelperService.createTokensAsUser(user);

    return {
      user,
      tokens,
    };
  }

  async login(
    dto: UserValidateDto,
  ): Promise<{ user: User; tokens: TokensType }> {
    // Find user
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw Causes.UNAUTHORIZED('Invalid email or password');
    }

    if (!user.isActive) {
      throw Causes.FORBIDDEN('User', 'User is not active');
    }

    // Check if the user has a password (might be social login only)
    if (!user.password) {
      throw Causes.UNAUTHORIZED(
        'This account does not have a password set. Please use social login.',
      );
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw Causes.UNAUTHORIZED('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.authHelperService.createTokensAsUser(user);

    return {
      user,
      tokens,
    };
  }
}
