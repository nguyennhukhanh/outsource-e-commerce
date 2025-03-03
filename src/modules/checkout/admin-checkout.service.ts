import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Checkout } from 'src/database/entities';
import { Repository } from 'typeorm';

import { CheckoutStatus } from './dto/checkout-status.enum';

@Injectable()
export class AdminCheckoutService {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
  ) {}

  async getAllCheckouts(page = 1, limit = 10, status?: string) {
    const queryBuilder = this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.user', 'user')
      .leftJoinAndSelect('checkout.checkoutItems', 'checkoutItems')
      .leftJoinAndSelect('checkoutItems.product', 'product')
      .orderBy('checkout.createdAt', 'DESC');

    if (status) {
      queryBuilder.where('checkout.status = :status', { status });
    }

    const [checkouts, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: checkouts,
      meta: {
        page,
        limit,
        total,
        pageCount: Math.ceil(total / limit),
      },
    };
  }

  async getCheckoutById(checkoutId: number): Promise<Checkout> {
    const checkout = await this.checkoutRepository.findOne({
      where: { id: checkoutId },
      relations: ['user', 'checkoutItems', 'checkoutItems.product'],
    });

    if (!checkout) {
      throw new NotFoundException('Checkout not found');
    }

    return checkout;
  }

  async updateCheckoutStatus(
    checkoutId: number,
    status: CheckoutStatus,
  ): Promise<Checkout> {
    const checkout = await this.getCheckoutById(checkoutId);

    checkout.status = status;
    return this.checkoutRepository.save(checkout);
  }

  async getCheckoutStatistics() {
    // Get total number of orders by status
    const statusCounts = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .select('checkout.status', 'status')
      .addSelect('COUNT(checkout.id)', 'count')
      .groupBy('checkout.status')
      .getRawMany();

    // Get total revenue
    const totalRevenue = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .where('checkout.status = :status', { status: CheckoutStatus.COMPLETED })
      .select('SUM(checkout.totalAmount)', 'total')
      .getRawOne();

    // Get recent orders
    const recentOrders = await this.checkoutRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return {
      ordersByStatus: statusCounts,
      totalRevenue: totalRevenue?.total || 0,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        customerName: order.user ? `${order.user.fullName}` : 'Unknown',
      })),
    };
  }
}
