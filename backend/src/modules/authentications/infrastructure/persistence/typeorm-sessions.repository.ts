import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async save(session: UserSession): Promise<UserSession> {
    const saved = await this.repository.save(
      UserSessionMapper.toPersistence(session),
    );
    return UserSessionMapper.toDomain(saved);
  }
}
