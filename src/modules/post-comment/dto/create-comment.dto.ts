import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Comment content' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'Post ID' })
  @IsNotEmpty()
  @IsNumber()
  postId: number;

  @ApiProperty({ description: 'Parent comment ID (optional)', required: false })
  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
