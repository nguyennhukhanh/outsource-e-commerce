import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/database/entities';
import { getLogger } from 'src/utils/logger';
import { Repository } from 'typeorm';

@Injectable()
export class CategorySeedService {
  logger = getLogger(CategorySeedService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async bootstrap(): Promise<void> {
    await this.truncateTables();
    await this.seedCategories();

    this.logger.info(
      'The data seeding process for Categories has been completed successfully!',
    );
  }

  private async truncateTables(): Promise<void> {
    await this.categoryRepository.query(`DELETE FROM category WHERE id > 0;`);
    await this.categoryRepository.query(
      `ALTER TABLE category AUTO_INCREMENT = 1;`,
    );
  }

  private async seedCategories(): Promise<void> {
    const categories = [
      {
        id: 1,
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        creatorId: 1,
      },
      {
        id: 2,
        name: 'Clothing',
        description: 'Fashion and apparel',
        creatorId: 1,
      },
      {
        id: 3,
        name: 'Books',
        description: 'Books and publications',
        creatorId: 1,
      },
    ];

    const values = categories
      .map(
        (category) =>
          `(${category.id}, '${category.name}', '${category.description}', ${category.creatorId})`,
      )
      .join(', ');

    await this.categoryRepository.query(
      `INSERT INTO category (id, name, description, creatorId) VALUES ${values};`,
    );
  }
}
