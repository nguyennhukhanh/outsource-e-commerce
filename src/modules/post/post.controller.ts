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
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Get all posts' })
  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @ApiOperation({ summary: 'Get a post by id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @ApiOperation({ summary: 'Get posts by user' })
  @Get('user/:userId')
  findUserPosts(@Param('userId', ParseIntPipe) userId: number) {
    return this.postService.findUserPosts(userId);
  }

  @ApiOperation({ summary: 'Create a new post' })
  @Post()
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  create(@GetUser() user: User, @Body() createPostDto: CreatePostDto) {
    return this.postService.create(user, createPostDto);
  }

  @ApiOperation({ summary: 'Update a post' })
  @Put(':id')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, user.id, updatePostDto);
  }

  @ApiOperation({ summary: 'Delete a post' })
  @Delete(':id')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.postService.remove(id, user.id);
  }

  @ApiOperation({ summary: 'Like a post' })
  @Post(':id/like')
  likePost(@Param('id', ParseIntPipe) id: number) {
    return this.postService.likePost(id);
  }
}
