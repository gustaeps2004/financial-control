import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserSession } from '../../domain/entities/user-session.entity';
import { SessionsRepository } from '../../domain/repositories/sessions.repository';
import { UserSessionEntity } from './entities/user-session.entity';
import { UserSessionMapper } from './mappers/user-session.mapper';

@Injectable()
export class TypeOrmSessionsRepository extends SessionsRepository {
  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly repository: Repository<UserSessionEntity>,
  ) {
    super();
  }

  async findActiveByToken(token: string): Promise<UserSession | null> {
    const entity = await this.repository.findOne({
      where: { token, revokedAt: IsNull() },
    });
    return entity ? UserSessionMapper.toDomain(entity) : null;
  }

  async save(session: UserSession): Promise<UserSession> {
    const saved = await this.repository.save(
      UserSessionMapper.toPersistence(session),
    );
    return UserSessionMapper.toDomain(saved);
  }
}
