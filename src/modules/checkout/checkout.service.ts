import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { User } from 'src/database/entities';
import { Checkout, CheckoutItem } from 'src/database/entities';
import { Repository } from 'typeorm';

import { CartService } from '../cart/cart.service';
import { CheckoutStatus } from './dto/checkout-status.enum';
import type { CreateCheckoutDto } from './dto/create-checkout.dto';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
    @InjectRepository(CheckoutItem)
    private readonly checkoutItemRepository: Repository<CheckoutItem>,
    private readonly cartService: CartService,
  ) {}

  async createCheckout(user: User, dto: CreateCheckoutDto): Promise<Checkout> {
    // Get the user's cart
    const cart = await this.cartService.getCart(user);

    if (!cart.cartItems || cart.cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    // Calculate total amount
    const totalAmount = cart.cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    // Create checkout
    const checkout = this.checkoutRepository.create({
      user,
      totalAmount,
      shippingAddress: dto.shippingAddress,
      methodPayment: dto.methodPayment,
      status: CheckoutStatus.PENDING,
    });

    const savedCheckout = await this.checkoutRepository.save(checkout);

    // Create checkout items
    for (const cartItem of cart.cartItems) {
      const checkoutItem = this.checkoutItemRepository.create({
        checkout: savedCheckout,
        product: cartItem.product,
        quantity: cartItem.quantity,
        price: cartItem.product.price,
      });
      await this.checkoutItemRepository.save(checkoutItem);
    }

    // Clear cart after checkout
    await this.cartService.clearCart(user);

    return this.getCheckoutById(user, savedCheckout.id);
  }

  async getCheckouts(user: User): Promise<Checkout[]> {
    return this.checkoutRepository.find({
      where: { user: { id: user.id } },
      relations: ['checkoutItems', 'checkoutItems.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getCheckoutById(user: User, checkoutId: number): Promise<Checkout> {
    const checkout = await this.checkoutRepository.findOne({
      where: {
        id: checkoutId,
        user: { id: user.id },
      },
      relations: ['checkoutItems', 'checkoutItems.product'],
    });

    if (!checkout) {
      throw new NotFoundException('Checkout not found');
    }

    return checkout;
  }

  async updateCheckoutStatus(
    user: User,
    checkoutId: number,
    status: string,
  ): Promise<Checkout> {
    const checkout = await this.getCheckoutById(user, checkoutId);

    checkout.status = status;
    return this.checkoutRepository.save(checkout);
  }

  async cancelCheckout(user: User, checkoutId: number): Promise<Checkout> {
    return this.updateCheckoutStatus(
      user,
      checkoutId,
      CheckoutStatus.CANCELLED,
    );
  }
}
