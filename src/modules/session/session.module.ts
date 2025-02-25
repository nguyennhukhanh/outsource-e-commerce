import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSession } from 'src/database/entities';

import { SessionService } from './session.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminSession])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
