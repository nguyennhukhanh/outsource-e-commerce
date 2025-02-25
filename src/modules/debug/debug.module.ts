import { Module } from '@nestjs/common';

import { DebugController } from './debug.controller';
import { DebugService } from './debug.service';

@Module({
  providers: [DebugService],
  controllers: [DebugController],
})
export class DebugModule {}
