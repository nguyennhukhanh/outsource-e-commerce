import { RoleEnum, SocialAuthEnum } from 'src/shared/enums';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Category, Product } from '.';
import { BaseTime } from './base/time.entity';

@Entity()
export class Admin extends BaseTime {
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

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.ADMIN,
    nullable: false,
  })
  role: RoleEnum;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Category, (category) => category.creator)
  categories: Category[];

  @OneToMany(() => Product, (product) => product.provider)
  products: Product[];
}
