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
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { Admin } from 'src/database/entities';
import { QueryPaginationDto } from 'src/shared/dto/pagination.query';

import { AdminJwtGuard } from '../auth/guards/admin_jwt.guard';
import { CategoryService } from './category.service';
import { CategoryQuery } from './dto/category.query';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategories(
    @Query() query?: CategoryQuery,
    @Query() pagination?: QueryPaginationDto,
  ) {
    return this.categoryService.getItems(query, pagination);
  }

  @Get(':id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getItem(id);
  }

  @Post()
  @UseGuards(AdminJwtGuard)
  createCategory(@GetUser() admin: Admin, @Body() dto: CreateCategoryDto) {
    return this.categoryService.createItemByRole(admin, dto);
  }

  @Put(':id')
  @UseGuards(AdminJwtGuard)
  updateCategory(
    @GetUser() admin: Admin,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.updateItemByRole(admin, id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  deleteCategory(
    @GetUser() admin: Admin,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoryService.deleteItemByRole(admin, id);
  }
}
