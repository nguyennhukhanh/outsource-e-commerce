import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content', example: 'Great product!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Rating (1-5)', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value, 10))
  rating?: number;

  @ApiProperty({ description: 'Product ID', example: 1 })
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  productId: number;
}
