import { SocialAuthEnum } from 'src/shared/enums';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BaseTime } from './base/time.entity';
import { Cart } from './cart.entity';
import { Checkout } from './checkout.entity';
import { ProductComment } from './product-comment.entity';

@Entity()
export class User extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100, nullable: false })
  email: string;

  @Column({ length: 100, nullable: false })
  fullName: string;

  @Column({ length: 255, nullable: true })
  socialId: string;

  @Column({
    type: 'enum',
    enum: SocialAuthEnum,
    default: SocialAuthEnum.GOOGLE,
    nullable: false,
  })
  socialType: SocialAuthEnum;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Checkout, (checkout) => checkout.user)
  checkouts: Checkout[];

  @OneToMany(() => ProductComment, (comment) => comment.user)
  productComments: ProductComment[];
}
