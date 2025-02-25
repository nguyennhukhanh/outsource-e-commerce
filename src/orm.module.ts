import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import type { StellaConfig } from './configs';
import type { DatabaseConfig } from './configs/database.config';
import entities from './database';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<StellaConfig>) => {
        const {
          type,
          host,
          port,
          username,
          password,
          database,
          synchronize,
          logging,
        } = configService.get<DatabaseConfig>('database');

        return {
          type,
          host,
          port,
          username,
          password,
          database,
          entities,
          synchronize,
          logging,
          autoLoadEntities: true,
          migrationsRun: true,
        } as TypeOrmModuleAsyncOptions;
      },
    }),
  ],
})
export class OrmModule {}
