import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { Admin } from 'src/database/entities';
import { QueryPaginationDto } from 'src/shared/dto/pagination.query';

import { AdminJwtGuard } from '../auth/guards/admin_jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQuery } from './dto/product.query';
import { ProductService } from './product.service';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({ summary: 'Get products' })
  @Get()
  getProducts(
    @Query() query?: ProductQuery,
    @Query() pagination?: QueryPaginationDto,
  ) {
    return this.productService.getItems(query, pagination);
  }

  @ApiOperation({ summary: 'Get product' })
  @Get(':id')
  getProduct(@Param('id', ParseIntPipe) id: number) {
    return this.productService.getItem(id);
  }

  @ApiOperation({ summary: 'Create product' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @Post()
  @UseGuards(AdminJwtGuard)
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  createProduct(
    @GetUser() admin: Admin,
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.createItemByRole(admin, dto, files);
  }

  @ApiOperation({ summary: 'Update product' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(AdminJwtGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  updateProduct(
    @GetUser() admin: Admin,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto?: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productService.updateItemByRole(admin, id, dto, files);
  }

  @ApiOperation({ summary: 'Delete product' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  deleteProduct(
    @GetUser() admin: Admin,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productService.deleteItemByRole(admin, id);
  }
}
