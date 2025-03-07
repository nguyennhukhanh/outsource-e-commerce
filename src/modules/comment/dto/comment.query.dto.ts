import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { CommonQuery } from 'src/shared/dto/common.query';

export class CommentProductQueryDto extends CommonQuery {
  @ApiPropertyOptional({
    description: 'Product ID to filter comments',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  productId?: number;

  @ApiPropertyOptional({
    description: 'User ID to filter comments',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  userId?: number;
}
