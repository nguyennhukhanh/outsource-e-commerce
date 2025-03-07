import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { User } from 'src/database/entities';
import { Product, ProductComment } from 'src/database/entities';
import type { QueryPaginationDto } from 'src/shared/dto/pagination.query';
import type { FetchResult } from 'src/utils/paginate';
import { FetchType, paginateEntities } from 'src/utils/paginate';
import { Repository } from 'typeorm';

import type { CommentProductQueryDto } from './dto/comment.query.dto';
import type { CreateProductCommentDto } from './dto/create-comment.dto';
import type { UpdateProductCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(ProductComment)
    private readonly commentRepository: Repository<ProductComment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getComments(
    query?: CommentProductQueryDto,
    pagination?: QueryPaginationDto,
  ): Promise<FetchResult<ProductComment>> {
    const { productId, userId, search, fromDate, toDate, sort } = query || {};
    const queryBuilder = this.commentRepository.createQueryBuilder('comment');

    queryBuilder
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.product', 'product');

    if (productId) {
      queryBuilder.andWhere('comment.product.id = :productId', { productId });
    }

    if (userId) {
      queryBuilder.andWhere('comment.user.id = :userId', { userId });
    }

    if (search) {
      queryBuilder.andWhere('comment.content LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (fromDate) {
      queryBuilder.andWhere('comment.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('comment.createdAt <= :toDate', { toDate });
    }

    if (sort) {
      queryBuilder.orderBy('comment.createdAt', sort);
    } else {
      queryBuilder.orderBy('comment.createdAt', 'DESC');
    }

    return await paginateEntities<ProductComment>(
      queryBuilder,
      pagination,
      FetchType.MANAGED,
    );
  }

  async getCommentById(id: number): Promise<ProductComment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async createComment(
    user: User,
    createDto: CreateProductCommentDto,
  ): Promise<ProductComment> {
    // Check if product exists
    const product = await this.productRepository.findOne({
      where: { id: createDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const comment = this.commentRepository.create({
      content: createDto.content,
      rating: createDto.rating || 0,
      user: user,
      product: product,
    });

    return await this.commentRepository.save(comment);
  }

  async updateComment(
    user: User,
    commentId: number,
    updateDto: UpdateProductCommentDto,
  ): Promise<ProductComment> {
    const comment = await this.getCommentById(commentId);

    // Check if user is the author of the comment
    if (comment.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own comments');
    }

    if (updateDto.content) {
      comment.content = updateDto.content;
    }

    if (updateDto.rating) {
      comment.rating = updateDto.rating;
    }

    return await this.commentRepository.save(comment);
  }

  async deleteComment(user: User, commentId: number): Promise<boolean> {
    const comment = await this.getCommentById(commentId);

    // Check if user is the author of the comment
    if (comment.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    const result = await this.commentRepository.delete(commentId);
    return result.affected > 0;
  }
}
