import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Array of category IDs',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      // Handle string input (either single value or comma-separated)
      return value.includes(',')
        ? value.split(',').map(Number)
        : [Number(value)];
    }
    // Handle array input
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  @IsArray({ message: 'categoryIds must be an array' })
  @IsNumber({}, { each: true, message: 'Each category ID must be a number' })
  categoryIds?: number[];

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  images?: Express.Multer.File[];
}
