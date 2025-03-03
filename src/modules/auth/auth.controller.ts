import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { SocialAuthEnum, SwaggerOperationEnum } from 'src/shared/enums';
import type { TokensType } from 'src/shared/types';
import { JwtPayloadType } from 'src/shared/types';

import { AuthFactory } from './auth.factory';
import { AuthHelperService } from './auth_helper.service';
import { ValidateByGoogleDto } from './dto/admin_social.validate';
import { UserCreateDto } from './dto/user.create';
import { UserValidateDto } from './dto/user.validate';
import { AdminJwtRefreshTokenGuard } from './guards/admin_jwt_refresh_token.guard';
import { UserJwtRefreshTokenGuard } from './guards/user_jwt_refresh_token.guard';
import { UserAuthService } from './user_auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authFactory: AuthFactory,
    private readonly authHelperService: AuthHelperService,
    private readonly userAuthService: UserAuthService,
  ) {}

  /**
   * Admin Routes
   */
  @ApiOperation({ summary: SwaggerOperationEnum.ADMIN })
  @Post('admin/login/google')
  async loginAsAdminWithGoogle(@Body() dto: ValidateByGoogleDto) {
    const authService = this.authFactory.getSocialAuthService(
      'admin',
      SocialAuthEnum.GOOGLE,
    );
    return await authService.createAdminSession(dto);
  }

  @ApiOperation({ summary: SwaggerOperationEnum.ADMIN })
  @ApiBearerAuth()
  @Get('admin/logout')
  @UseGuards(AdminJwtRefreshTokenGuard)
  async logoutAsAdmin(@GetUser('session') session: string): Promise<boolean> {
    return await this.authHelperService.logoutAsAdmin(session);
  }

  @ApiOperation({ summary: SwaggerOperationEnum.ADMIN })
  @ApiBearerAuth()
  @Get('admin/refresh-token')
  @UseGuards(AdminJwtRefreshTokenGuard)
  async refreshTokenAsAdmin(
    @GetUser() admin: JwtPayloadType,
  ): Promise<TokensType> {
    return await this.authHelperService.refreshTokenAsAdmin(admin);
  }

  /**
   * User Routes
   */
  @ApiOperation({ summary: SwaggerOperationEnum.USER })
  @Post('user/register')
  async registerUser(@Body() dto: UserCreateDto) {
    return await this.userAuthService.register(dto);
  }

  @ApiOperation({ summary: SwaggerOperationEnum.USER })
  @Post('user/login')
  async loginUser(@Body() dto: UserValidateDto) {
    return await this.userAuthService.login(dto);
  }

  @ApiOperation({ summary: SwaggerOperationEnum.USER })
  @Post('user/login/google')
  async loginAsUserWithGoogle(@Body() dto: ValidateByGoogleDto) {
    const authService = this.authFactory.getSocialAuthService(
      'user',
      SocialAuthEnum.GOOGLE,
    );
    return await authService.createUserSession(dto);
  }

  @ApiOperation({ summary: SwaggerOperationEnum.USER })
  @ApiBearerAuth()
  @Get('user/logout')
  @UseGuards(UserJwtRefreshTokenGuard)
  async logoutAsUser(@GetUser('session') session: string): Promise<boolean> {
    return await this.authHelperService.logoutAsUser(session);
  }

  @ApiOperation({ summary: SwaggerOperationEnum.USER })
  @ApiBearerAuth()
  @Get('user/refresh-token')
  @UseGuards(UserJwtRefreshTokenGuard)
  async refreshTokenAsUser(
    @GetUser() user: JwtPayloadType,
  ): Promise<TokensType> {
    return await this.authHelperService.refreshTokenAsUser(user);
  }
}
