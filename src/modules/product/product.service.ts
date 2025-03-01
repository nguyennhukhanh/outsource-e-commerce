import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
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

  private async saveImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadDir = 'public/products';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedFiles: string[] = [];
    for (const file of files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}-${file.originalname}`;
      const filePath = path.join(uploadDir, filename);

      await fs.promises.writeFile(filePath, file.buffer);
      savedFiles.push(`/${uploadDir}/${filename}`);
    }
    return savedFiles;
  }

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

  async createItemByRole(
    role: Admin,
    dto: CreateProductDto,
    files?: Express.Multer.File[],
  ): Promise<Product> {
    const { categoryIds, ...productData } = dto;
    const product = this.productRepository.create({
      ...productData,
      provider: role,
      images: [],
    });

    if (files?.length) {
      product.images = await this.saveImages(files);
    }

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
    dto?: CreateProductDto, // Changed from Partial<Product> to CreateProductDto
    files?: Express.Multer.File[],
  ): Promise<boolean> {
    const product = await this.getItem(id);
    const { categoryIds, ...updateData } = dto; // Extract categoryIds

    if (categoryIds?.length) {
      // Delete existing categories
      await this.productCategoryRepository.delete({ product: { id } });

      // Create new category relationships
      const productCategories = categoryIds.map((categoryId) =>
        this.productCategoryRepository.create({
          product,
          category: { id: categoryId },
        }),
      );
      await this.productCategoryRepository.save(productCategories);
    }

    Object.assign(product, updateData);

    if (files?.length) {
      // Delete old images if they exist
      if (product.images?.length) {
        for (const oldImage of product.images) {
          const filePath = path.join(process.cwd(), oldImage);
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        }
      }

      // Save new images
      product.images = await this.saveImages(files);
    }

    await this.productRepository.save(product);
    return true;
  }

  async deleteItemByRole(role: Admin, id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return result.affected > 0;
  }
}
