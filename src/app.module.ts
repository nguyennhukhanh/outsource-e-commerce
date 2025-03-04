import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { ExceptionFilter } from './common/exceptions/exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { load } from './configs';
import { AuthModule } from './modules/auth/auth.module';
import { RoleGuard } from './modules/auth/guards/role.guard';
import { CartModule } from './modules/cart/cart.module';
import { CategoryModule } from './modules/category/category.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { CommentModule } from './modules/comment/comment.module';
import { DebugModule } from './modules/debug/debug.module';
import { HealthController } from './modules/default/health.controller';
import { PostModule } from './modules/post/post.module';
import { PostCommentModule } from './modules/post-comment/post-comment.module';
import { ProductModule } from './modules/product/product.module';
import { SessionModule } from './modules/session/session.module';
import { OrmModule } from './orm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    OrmModule,
    AuthModule,
    SessionModule,
    DebugModule,
    CategoryModule,
    ProductModule,
    CartModule,
    CommentModule,
    CheckoutModule,
    PostModule,
    PostCommentModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
