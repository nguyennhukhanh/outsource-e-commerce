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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/user.decorator';
import { User } from 'src/database/entities';
import { QueryPaginationDto } from 'src/shared/dto/pagination.query';

import { UserJwtGuard } from '../auth/guards/user_jwt.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { PostQuery } from './dto/post.query';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

@ApiTags('post')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Get all posts with pagination and filtering' })
  @Get()
  findAll(
    @Query() query?: PostQuery,
    @Query() pagination?: QueryPaginationDto,
  ) {
    return this.postService.findAll(query, pagination);
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5)) // Allow up to 5 images
  create(
    @GetUser() user: User,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.postService.create(user, createPostDto, files);
  }

  @ApiOperation({ summary: 'Update a post' })
  @Put(':id')
  @UseGuards(UserJwtGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5)) // Allow up to 5 images
  update(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.postService.update(id, user.id, updatePostDto, files);
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
