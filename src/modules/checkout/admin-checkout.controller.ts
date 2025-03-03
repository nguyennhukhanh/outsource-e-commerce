import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { AdminJwtGuard } from '../auth/guards/admin_jwt.guard';
import { AdminCheckoutService } from './admin-checkout.service';
import { UpdateCheckoutStatusDto } from './dto/update-checkout-status.dto';

@ApiTags('admin/checkouts')
@Controller('admin/checkouts')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminCheckoutController {
  constructor(private readonly adminCheckoutService: AdminCheckoutService) {}

  @ApiOperation({ summary: 'Get all checkouts for admin' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @Get()
  getAllCheckouts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('status') status?: string,
  ) {
    return this.adminCheckoutService.getAllCheckouts(+page, +limit, status);
  }

  @ApiOperation({ summary: 'Get a checkout by id for admin' })
  @Get(':id')
  getCheckoutById(@Param('id', ParseIntPipe) id: number) {
    return this.adminCheckoutService.getCheckoutById(id);
  }

  @ApiOperation({ summary: 'Update checkout status for admin' })
  @Put(':id/status')
  updateCheckoutStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCheckoutStatusDto,
  ) {
    return this.adminCheckoutService.updateCheckoutStatus(id, dto.status);
  }

  @ApiOperation({ summary: 'Get checkout statistics for admin' })
  @Get('statistics/summary')
  getCheckoutStatistics() {
    return this.adminCheckoutService.getCheckoutStatistics();
  }
}
