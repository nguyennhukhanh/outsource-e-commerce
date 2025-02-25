import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'; // Add @Res
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { SwaggerOperationEnum } from 'src/shared/enums';

import { AdminJwtGuard } from '../auth/guards/admin_jwt.guard';
import { DebugService } from './debug.service';

@ApiBearerAuth()
@UseGuards(AdminJwtGuard)
@ApiTags('debug')
@Controller('debug')
export class DebugController {
  constructor(private readonly debugService: DebugService) {}

  @ApiOperation({ summary: SwaggerOperationEnum.ADMIN })
  @Get('logs')
  getLogs() {
    return this.debugService.getLogs();
  }

  @ApiOperation({ summary: SwaggerOperationEnum.ADMIN })
  @Get('log/:fileName')
  readLog(@Res() res: Response, @Param('fileName') fileName: string): string {
    return this.debugService.readLog(res, fileName);
  }
}
