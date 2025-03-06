import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { CommonQuery } from 'src/shared/dto/common.query';

export class PostQuery extends CommonQuery {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  userId?: number;

  @ApiPropertyOptional({ description: 'Filter by minimum likes' })
  @IsOptional()
  minLikes?: number;

  @ApiPropertyOptional({ description: 'Filter by minimum views' })
  @IsOptional()
  minViews?: number;
}
