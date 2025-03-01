import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEnum, SocialAuthEnum } from 'src/shared/enums';
import { getLogger } from 'src/utils/logger';
import { Repository } from 'typeorm';

import { Admin } from '../../entities';

@Injectable()
export class AdminSeedService {
  logger = getLogger(AdminSeedService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async bootstrap(): Promise<void> {
    await this.truncateTables();
    await this.seedAdmin();

    this.logger.info(
      'The data seeding process for Admin has been completed successfully!',
    );
  }

  private async truncateTables(): Promise<void> {
    await this.adminRepository.query(`DELETE FROM admin WHERE id > 0;`);
    await this.adminRepository.query(`ALTER TABLE admin AUTO_INCREMENT = 1;`);
  }

  private async seedAdmin(): Promise<void> {
    const admins = [
      {
        id: 1,
        email: 'kwalker.nnk@gmail.com',
        fullName: 'Francies Nguyen',
        socialType: SocialAuthEnum.GOOGLE,
        role: RoleEnum.SUPER_ADMIN,
        isActive: true,
      },
      {
        id: 2,
        email: 'hoigamedev932@gmail.com',
        fullName: 'Hoi Dev',
        socialType: SocialAuthEnum.GOOGLE,
        role: RoleEnum.SUPER_ADMIN,
        isActive: true,
      },
    ];

    const values = admins
      .map(
        (admin) =>
          `(${admin.id}, '${admin.email}', '${admin.fullName}', '${admin.socialType}', '${admin.role}', ${admin.isActive})`,
      )
      .join(', ');

    await this.adminRepository.query(
      `INSERT INTO admin (id, email, fullName, socialType, role, isActive) VALUES ${values};`,
    );
  }
}
