import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/database/entities';

import { CategorySeedService } from './category_seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  providers: [CategorySeedService],
  exports: [CategorySeedService],
})
export class CategorySeedModule {}
