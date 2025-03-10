import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { load } from 'src/configs';
import { OrmModule } from 'src/orm.module';

import { AdminSeedModule } from './admin/admin_seed.module';
import { CategorySeedModule } from './category/category_seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      load,
    }),
    OrmModule,
    AdminSeedModule,
    CategorySeedModule,
  ],
})
export class SeedModule {}
