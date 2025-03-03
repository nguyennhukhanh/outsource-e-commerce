import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CheckoutItem, User } from '.';
import { BaseTime } from './base/time.entity';

@Entity()
export class Checkout extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ length: 255 })
  shippingAddress: string;

  @Column({ length: 20 })
  status: string; // 'pending' | 'processing' | 'completed' | 'cancelled'

  @Column({ length: 20 })
  methodPayment: string; // 'cash' | 'credit_card' | 'debit_card'

  @ManyToOne(() => User, (user) => user.checkouts)
  user: User;

  @OneToMany(() => CheckoutItem, (checkoutItem) => checkoutItem.checkout)
  checkoutItems: CheckoutItem[];
}
