import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Product, User } from '.';
import { BaseTime } from './base/time.entity';

@Entity()
export class ProductComment extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'int', default: 0, nullable: true })
  rating: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => User, (user) => user.productComments)
  user: User;

  @ManyToOne(() => Product, (product) => product.comments)
  product: Product;
}
