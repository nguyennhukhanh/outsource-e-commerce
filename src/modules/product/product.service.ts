import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Admin } from 'src/database/entities';
import { Product, ProductCategory } from 'src/database/entities';
import type { QueryPaginationDto } from 'src/shared/dto/pagination.query';
import type { IService } from 'src/shared/interfaces/service.interface';
import type { FetchResult } from 'src/utils/paginate';
import { FetchType, paginateEntities } from 'src/utils/paginate';
import { Repository } from 'typeorm';

import type { CreateProductDto } from './dto/create-product.dto';
import type { ProductQuery } from './dto/product.query';

@Injectable()
export class ProductService
  implements
    IService<ProductQuery, QueryPaginationDto, CreateProductDto, Product>
{
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductCategory)
    private readonly productCategoryRepository: Repository<ProductCategory>,
  ) {}

  async getItems(
    query?: ProductQuery,
    pagination?: QueryPaginationDto,
  ): Promise<FetchResult<Product>> {
    const { search, categoryId, minPrice, maxPrice, fromDate, toDate, sort } =
      query;
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.andWhere('product.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (categoryId) {
      queryBuilder
        .innerJoin('product.productCategories', 'pc')
        .andWhere('pc.categoryId = :categoryId', { categoryId });
    }

    if (minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (fromDate) {
      queryBuilder.andWhere('product.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('product.createdAt <= :toDate', { toDate });
    }

    if (sort) {
      queryBuilder.orderBy('product.createdAt', sort);
    }

    return await paginateEntities<Product>(
      queryBuilder,
      pagination,
      FetchType.MANAGED,
    );
  }

  async getItem(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: [
        'provider',
        'productCategories',
        'productCategories.category',
      ],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createItemByRole(role: Admin, dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create({
      ...dto,
      provider: role,
    });

    await this.productRepository.save(product);

    if (dto.categoryIds?.length) {
      const productCategories = dto.categoryIds.map((categoryId) =>
        this.productCategoryRepository.create({
          product,
          category: { id: categoryId },
        }),
      );
      await this.productCategoryRepository.save(productCategories);
    }

    return this.getItem(product.id);
  }

  async updateItemByRole(
    role: Admin,
    id: number,
    dto: Partial<Product>,
  ): Promise<boolean> {
    const product = await this.getItem(id);

    if (dto.productCategories) {
      await this.productCategoryRepository.delete({ product: { id } });
      await this.productCategoryRepository.save(dto.productCategories);
      delete dto.productCategories;
    }

    Object.assign(product, dto);
    await this.productRepository.save(product);
    return true;
  }

  async deleteItemByRole(role: Admin, id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected > 0;
  }
}
