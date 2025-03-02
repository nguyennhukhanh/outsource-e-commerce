import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateCommentDto {
  @ApiPropertyOptional({
    description: 'Comment content',
    example: 'Updated review',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Rating (1-5)', example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value, 10))
  rating?: number;
}
