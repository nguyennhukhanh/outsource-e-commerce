import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { BaseTime } from './base/time.entity';
import { Category } from './category.entity';
import { Product } from './product.entity';

@Entity()
export class ProductCategory extends BaseTime {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productCategories)
  product: Product;

  @ManyToOne(() => Category, (category) => category.productCategories)
  category: Category;
}
