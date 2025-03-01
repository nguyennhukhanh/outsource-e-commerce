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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('cart')
@Controller('cart')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @ApiOperation({ summary: 'Get cart' })
  @Get()
  getCart(@GetUser() user: User) {
    return this.cartService.getCart(user);
  }

  @ApiOperation({ summary: 'Add to cart' })
  @Post()
  addToCart(@GetUser() user: User, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user, dto);
  }

  @ApiOperation({ summary: 'Update cart item' })
  @Put(':itemId')
  updateCartItem(
    @GetUser() user: User,
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(user, itemId, dto.quantity);
  }

  @ApiOperation({ summary: 'Remove cart item' })
  @Delete(':itemId')
  removeCartItem(
    @GetUser() user: User,
    @Param('itemId', ParseIntPipe) itemId: number,
  ) {
    return this.cartService.removeCartItem(user, itemId);
  }

  @ApiOperation({ summary: 'Clear cart' })
  @Delete()
  clearCart(@GetUser() user: User) {
    return this.cartService.clearCart(user);
  }
}
