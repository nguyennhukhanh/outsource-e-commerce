import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { CheckoutStatus } from './checkout-status.enum';

export class UpdateCheckoutStatusDto {
  @ApiProperty({
    enum: CheckoutStatus,
    description: 'Status of the checkout',
    example: CheckoutStatus.PROCESSING,
  })
  @IsEnum(CheckoutStatus)
  status: CheckoutStatus;
}
