import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/database/entities';

import { UserJwtGuard } from '../auth/guards/user_jwt.guard';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PostCommentService } from './post-comment.service';

@ApiTags('post-comment')
@Controller('post-comment')
export class PostCommentController {
  constructor(private readonly commentService: PostCommentService) {}

  @ApiOperation({ summary: 'Get a comment by id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @ApiOperation({ summary: 'Get comments by post' })
  @Get('post/:postId')
  findPostComments(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentService.findPostComments(postId);
  }

  @ApiOperation({ summary: 'Get comments by user' })
  @Get('user/:userId')
  findUserComments(@Param('userId', ParseIntPipe) userId: number) {
    return this.commentService.findUserComments(userId);
  }

  @ApiOperation({ summary: 'Create a new comment' })
  @Post()
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  create(@GetUser() user: User, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(user, createCommentDto);
  }

  @ApiOperation({ summary: 'Update a comment' })
  @Put(':id')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(id, user.id, updateCommentDto);
  }

  @ApiOperation({ summary: 'Delete a comment' })
  @Delete(':id')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.commentService.remove(id, user.id);
  }
}
