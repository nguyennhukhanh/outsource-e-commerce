import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Checkout, Product } from '.';
import { BaseTime } from './base/time.entity';

@Entity()
export class CheckoutItem extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => Checkout, (checkout) => checkout.checkoutItems)
  checkout: Checkout;
}
