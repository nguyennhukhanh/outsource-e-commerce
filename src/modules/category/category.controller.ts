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
import { CategoryService } from './category.service';
import { CategoryQuery } from './dto/category.query';
import { CreateCategoryDto } from './dto/create-category.dto';

@ApiTags('category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'Get categories' })
  @Get()
  getCategories(
    @Query() query?: CategoryQuery,
    @Query() pagination?: QueryPaginationDto,
  ) {
    return this.categoryService.getItems(query, pagination);
  }

  @ApiOperation({ summary: 'Get category' })
  @Get(':id')
  getCategory(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.getItem(id);
  }

  @ApiOperation({ summary: 'Create category' })
  @ApiBearerAuth()
  @Post()
  @UseGuards(AdminJwtGuard)
  createCategory(@GetUser() admin: Admin, @Body() dto: CreateCategoryDto) {
    return this.categoryService.createItemByRole(admin, dto);
  }

  @ApiOperation({ summary: 'Update category' })
  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(AdminJwtGuard)
  updateCategory(
    @GetUser() admin: Admin,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoryService.updateItemByRole(admin, id, dto);
  }

  @ApiOperation({ summary: 'Delete category' })
  @ApiBearerAuth()
  @Delete(':id')
  @UseGuards(AdminJwtGuard)
  deleteCategory(
    @GetUser() admin: Admin,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.categoryService.deleteItemByRole(admin, id);
  }
}
