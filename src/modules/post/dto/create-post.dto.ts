import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ description: 'Post title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Post content' })
  @IsNotEmpty()
  @IsString()
  content: string;
}
