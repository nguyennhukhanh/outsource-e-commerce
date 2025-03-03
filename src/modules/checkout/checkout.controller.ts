import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/database/entities';

import { UserJwtGuard } from '../auth/guards/user_jwt.guard';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@ApiTags('checkout')
@Controller('checkout')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @ApiOperation({ summary: 'Create a new checkout' })
  @Post()
  createCheckout(@GetUser() user: User, @Body() dto: CreateCheckoutDto) {
    return this.checkoutService.createCheckout(user, dto);
  }

  @ApiOperation({ summary: 'Get all user checkouts' })
  @Get()
  getCheckouts(@GetUser() user: User) {
    return this.checkoutService.getCheckouts(user);
  }

  @ApiOperation({ summary: 'Get a checkout by id' })
  @Get(':id')
  getCheckoutById(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.checkoutService.getCheckoutById(user, id);
  }

  @ApiOperation({ summary: 'Cancel a checkout' })
  @Put(':id/cancel')
  cancelCheckout(@GetUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.checkoutService.cancelCheckout(user, id);
  }

  @ApiOperation({ summary: 'Update checkout status' })
  @Put(':id/status/:status')
  updateCheckoutStatus(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: string,
  ) {
    return this.checkoutService.updateCheckoutStatus(user, id, status);
  }
}
