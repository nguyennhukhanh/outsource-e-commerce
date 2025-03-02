import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  @Min(0)
  quantity: number;
}
