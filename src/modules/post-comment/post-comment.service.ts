import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { User } from 'src/database/entities';
import { Comment, Post } from 'src/database/entities';
import { Repository } from 'typeorm';

import type { CreateCommentDto } from './dto/create-comment.dto';
import type { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class PostCommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'post', 'parentComment', 'replies'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async findPostComments(postId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: {
        post: { id: postId },
        parentComment: null, // Only fetch top-level comments
      },
      relations: ['user', 'replies', 'replies.user'],
    });
  }

  async findUserComments(userId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { user: { id: userId } },
      relations: ['post', 'parentComment', 'replies'],
    });
  }

  async create(
    user: User,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const post = await this.postRepository.findOne({
      where: { id: createCommentDto.postId },
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID ${createCommentDto.postId} not found`,
      );
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      user,
      post,
    });

    if (createCommentDto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentCommentId },
      });

      if (!parentComment) {
        throw new NotFoundException(
          `Parent comment with ID ${createCommentDto.parentCommentId} not found`,
        );
      }

      comment.parentComment = parentComment;
    }

    return this.commentRepository.save(comment);
  }

  async update(
    id: number,
    userId: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!comment) {
      throw new NotFoundException(
        `Comment with ID ${id} not found or you don't have permission to modify it`,
      );
    }

    Object.assign(comment, updateCommentDto);
    return this.commentRepository.save(comment);
  }

  async remove(id: number, userId: number): Promise<boolean> {
    const comment = await this.commentRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!comment) {
      throw new NotFoundException(
        `Comment with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    await this.commentRepository.remove(comment);
    return true;
  }
}
