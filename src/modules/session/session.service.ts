import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminSession, UserSession } from 'src/database/entities';
import type { DeepPartial, FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';

type SessionType = UserSession | AdminSession;
type EntityKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(AdminSession)
    private readonly adminSessionRepository: Repository<AdminSession>,
  ) {}

  private async handleSession<T extends SessionType>(
    options: DeepPartial<T>,
    repository: Repository<T>,
    entityKey: EntityKeys<T>,
  ): Promise<T> {
    const entityKeyStr = String(entityKey);
    const { id, [entityKeyStr]: entity } = options as any;
    let existingSession: T | null = null;

    if (entity) {
      existingSession = await repository
        .createQueryBuilder('session')
        .where(`session.${entityKeyStr} = :entityId`, { entityId: entity.id })
        .getOne();
    } else if (id) {
      existingSession = await repository
        .createQueryBuilder('session')
        .where('session.id = :id', { id })
        .innerJoinAndSelect(`session.${entityKeyStr}`, entityKeyStr)
        .getOne();
    }

    if (existingSession) {
      await repository.delete({
        id: existingSession.id,
      } as FindOptionsWhere<T>);
    }

    if (id && existingSession) {
      options[entityKeyStr] = existingSession[entityKeyStr];
      delete options.id;
    }

    return repository.save(repository.create(options));
  }

  async createUserSession(
    options: DeepPartial<UserSession>,
  ): Promise<UserSession> {
    return this.handleSession(options, this.userSessionRepository, 'user');
  }

  async createAdminSession(
    options: DeepPartial<AdminSession>,
  ): Promise<AdminSession> {
    return this.handleSession(options, this.adminSessionRepository, 'admin');
  }

  async deleteUserSession(options: DeepPartial<UserSession>): Promise<boolean> {
    const { affected } = await this.userSessionRepository.delete(
      options as FindOptionsWhere<UserSession>,
    );
    return affected > 0;
  }

  async deleteAdminSession(
    options: DeepPartial<AdminSession>,
  ): Promise<boolean> {
    const { affected } = await this.adminSessionRepository.delete(
      options as FindOptionsWhere<AdminSession>,
    );
    return affected > 0;
  }
}
