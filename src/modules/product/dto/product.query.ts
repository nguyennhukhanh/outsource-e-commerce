import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQuery } from 'src/shared/dto/common.query';

export class ProductQuery extends CommonQuery {
  @ApiPropertyOptional()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  maxPrice?: number;
}
