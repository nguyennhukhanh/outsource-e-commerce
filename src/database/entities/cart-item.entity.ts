import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Cart, Product } from '.';
import { BaseTime } from './base/time.entity';

@Entity()
export class CartItem extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @ManyToOne(() => Cart, (cart) => cart.cartItems)
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems)
  product: Product;
}
