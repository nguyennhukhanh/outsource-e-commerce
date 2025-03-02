import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Admin } from 'src/database/entities';
import { Category } from 'src/database/entities';
import type { QueryPaginationDto } from 'src/shared/dto/pagination.query';
import type { IService } from 'src/shared/interfaces/service.interface';
import {
  type FetchResult,
  FetchType,
  paginateEntities,
} from 'src/utils/paginate';
import { Repository } from 'typeorm';

import type { CategoryQuery } from './dto/category.query';
import type { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService
  implements
    IService<CategoryQuery, QueryPaginationDto, CreateCategoryDto, Category>
{
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async getItems(
    query?: CategoryQuery,
    pagination?: QueryPaginationDto,
  ): Promise<FetchResult<Category>> {
    const { search, fromDate, toDate, sort } = query;
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (search) {
      queryBuilder.andWhere('category.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (fromDate) {
      queryBuilder.andWhere('category.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('category.createdAt <= :toDate', { toDate });
    }

    if (sort) {
      queryBuilder.orderBy('category.createdAt', sort);
    }

    return await paginateEntities<Category>(
      queryBuilder,
      pagination,
      FetchType.MANAGED,
    );
  }

  async getItem(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['creator'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createItemByRole(
    role: Admin,
    dto: CreateCategoryDto,
  ): Promise<Category> {
    const categoryExist = await this.categoryRepository.findOne({
      where: { name: dto.name },
      select: ['id'],
    });
    if (categoryExist) throw new ConflictException('Category already exists');

    const category = this.categoryRepository.create({
      ...dto,
      creator: role,
    });
    return await this.categoryRepository.save(category);
  }

  async updateItemByRole(
    role: Admin,
    id: number,
    dto: Partial<Category>,
  ): Promise<boolean> {
    const category = await this.getItem(id);

    // Check for name conflict if name is being updated
    if (dto.name && dto.name !== category.name) {
      const categoryWithSameName = await this.categoryRepository.findOne({
        where: { name: dto.name },
        select: ['id'],
      });

      if (categoryWithSameName && categoryWithSameName.id !== id) {
        throw new ConflictException('Category name already exists');
      }
    }

    Object.assign(category, dto);
    await this.categoryRepository.save(category);
    return true;
  }

  async deleteItemByRole(role: Admin, id: number): Promise<boolean> {
    const result = await this.categoryRepository.delete(id);
    return result.affected > 0;
  }
}
