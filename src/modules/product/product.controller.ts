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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  @ApiBearerAuth()
  @Post()
  @UseGuards(AdminJwtGuard)
  createProduct(@GetUser() admin: Admin, @Body() dto: CreateProductDto) {
    return this.productService.createItemByRole(admin, dto);
  }

  @ApiOperation({ summary: 'Update product' })
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(AdminJwtGuard)
  updateProduct(
    @GetUser() admin: Admin,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductDto,
  ) {
    return this.productService.updateItemByRole(admin, id, dto);
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
