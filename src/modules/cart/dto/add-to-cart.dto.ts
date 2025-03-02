import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  productId: number;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}
