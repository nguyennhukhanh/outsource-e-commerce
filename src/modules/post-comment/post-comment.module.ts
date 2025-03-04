import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment, Post } from 'src/database/entities';

import { PostCommentController } from './post-comment.controller';
import { PostCommentService } from './post-comment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  providers: [PostCommentService],
  controllers: [PostCommentController],
  exports: [PostCommentService],
})
export class PostCommentModule {}
