import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { User } from 'src/database/entities';
import { Cart, CartItem } from 'src/database/entities';
import { Repository } from 'typeorm';

import type { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async getCart(user: User): Promise<any> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['cartItems', 'cartItems.product'],
    });

    if (!cart) {
      return this.cartRepository.save(
        this.cartRepository.create({
          user,
          cartItems: [],
        }),
      );
    }

    // Calculate total amount
    const totalAmount = cart.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    // Add calculated total to the response without modifying the entity
    return {
      ...cart,
      totalAmount,
      cartItems: cart.cartItems.map((item) => ({
        ...item,
        itemTotal: item.product.price * item.quantity,
      })),
    };
  }

  async addToCart(user: User, dto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(user);

    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cart.id },
        product: { id: dto.productId },
      },
    });

    if (existingItem) {
      existingItem.quantity += dto.quantity;
      await this.cartItemRepository.save(existingItem);
    } else {
      const cartItem = this.cartItemRepository.create({
        cart,
        product: { id: dto.productId },
        quantity: dto.quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(user);
  }

  async updateCartItem(
    user: User,
    itemId: number,
    quantity: number,
  ): Promise<Cart> {
    const cart = await this.getCart(user);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getCart(user);
  }

  async removeCartItem(user: User, itemId: number): Promise<Cart> {
    const cart = await this.getCart(user);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
    return this.getCart(user);
  }

  async clearCart(user: User): Promise<boolean> {
    const cart = await this.getCart(user);
    await this.cartItemRepository.delete({ cart: { id: cart.id } });
    return true;
  }
}
