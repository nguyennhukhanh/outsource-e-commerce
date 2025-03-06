import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import type { User } from 'src/database/entities';
import { Post } from 'src/database/entities';
import type { QueryPaginationDto } from 'src/shared/dto/pagination.query';
import type { FetchResult } from 'src/utils/paginate';
import { FetchType, paginateEntities } from 'src/utils/paginate';
import { Repository } from 'typeorm';

import type { CreatePostDto } from './dto/create-post.dto';
import type { PostQuery } from './dto/post.query';
import type { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  private async saveImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadDir = 'public/posts';
    const postsDir = 'posts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savedFiles: string[] = [];
    for (const file of files) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `${uniqueSuffix}-${file.originalname}`;
      const filePath = path.join(uploadDir, filename);

      await fs.promises.writeFile(filePath, file.buffer);
      savedFiles.push(`/${postsDir}/${filename}`);
    }
    return savedFiles;
  }

  async findAll(
    query?: PostQuery,
    pagination?: QueryPaginationDto,
  ): Promise<FetchResult<Post>> {
    const { search, userId, minLikes, minViews, fromDate, toDate, sort } =
      query;
    const queryBuilder = this.postRepository.createQueryBuilder('post');

    queryBuilder.leftJoinAndSelect('post.user', 'user');
    queryBuilder.leftJoinAndSelect('post.comments', 'comments');

    if (search) {
      queryBuilder.andWhere(
        '(post.title LIKE :search OR post.content LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (userId) {
      queryBuilder.andWhere('post.userId = :userId', { userId });
    }

    if (minLikes) {
      queryBuilder.andWhere('post.likes >= :minLikes', { minLikes });
    }

    if (minViews) {
      queryBuilder.andWhere('post.viewCount >= :minViews', { minViews });
    }

    if (fromDate) {
      queryBuilder.andWhere('post.createdAt >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('post.createdAt <= :toDate', { toDate });
    }

    // Random order if no sort specified
    queryBuilder.orderBy('RAND()');

    return await paginateEntities<Post>(
      queryBuilder,
      pagination,
      FetchType.MANAGED,
    );
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user', 'comments'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Increment view count
    post.viewCount += 1;
    await this.postRepository.save(post);

    return post;
  }

  async findUserPosts(userId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'comments'],
    });
  }

  async create(
    user: User,
    createPostDto: CreatePostDto,
    files?: Express.Multer.File[],
  ): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      user,
      images: [],
    });

    if (files?.length) {
      post.images = await this.saveImages(files);
    }

    return this.postRepository.save(post);
  }

  async update(
    id: number,
    userId: number,
    updatePostDto: UpdatePostDto,
    files?: Express.Multer.File[],
  ): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID ${id} not found or you don't have permission to modify it`,
      );
    }

    Object.assign(post, updatePostDto);

    if (files?.length) {
      // Delete old images if they exist
      if (post.images?.length) {
        for (const oldImage of post.images) {
          const filePath = path.join(
            process.cwd(),
            'public',
            oldImage.replace(/^\//, ''),
          );
          if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
          }
        }
      }

      // Save new images
      post.images = await this.saveImages(files);
    }

    return this.postRepository.save(post);
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const post = await this.postRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    await this.postRepository.remove(post);
    return true;
  }

  async likePost(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    post.likes += 1;
    return this.postRepository.save(post);
  }
}
