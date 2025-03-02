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
import { User } from 'src/database/entities';
import { QueryPaginationDto } from 'src/shared/dto/pagination.query';

import { UserJwtGuard } from '../auth/guards/user_jwt.guard';
import { CommentService } from './comment.service';
import { CommentQueryDto } from './dto/comment.query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'Get all comments' })
  @Get()
  findAll(
    @Query() query?: CommentQueryDto,
    @Query() pagination?: QueryPaginationDto,
  ) {
    return this.commentService.getComments(query, pagination);
  }

  @ApiOperation({ summary: 'Get comment by ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getCommentById(id);
  }

  @ApiOperation({ summary: 'Create a new comment' })
  @ApiBearerAuth()
  @UseGuards(UserJwtGuard)
  @Post()
  create(@GetUser() user: User, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(user, createCommentDto);
  }

  @ApiOperation({ summary: 'Update comment' })
  @ApiBearerAuth()
  @UseGuards(UserJwtGuard)
  @Put(':id')
  update(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.updateComment(user, id, updateCommentDto);
  }

  @ApiOperation({ summary: 'Delete comment' })
  @ApiBearerAuth()
  @UseGuards(UserJwtGuard)
  @Delete(':id')
  delete(@GetUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.commentService.deleteComment(user, id);
  }
}
