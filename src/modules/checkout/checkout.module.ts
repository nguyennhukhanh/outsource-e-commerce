import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkout, CheckoutItem } from 'src/database/entities';

import { CartModule } from '../cart/cart.module';
import { AdminCheckoutController } from './admin-checkout.controller';
import { AdminCheckoutService } from './admin-checkout.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';

@Module({
  imports: [TypeOrmModule.forFeature([Checkout, CheckoutItem]), CartModule],
  providers: [CheckoutService, AdminCheckoutService],
  controllers: [CheckoutController, AdminCheckoutController],
  exports: [CheckoutService, AdminCheckoutService],
})
export class CheckoutModule {}
