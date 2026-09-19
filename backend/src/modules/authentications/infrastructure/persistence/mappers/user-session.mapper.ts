import { UserSession } from '../../../domain/entities/user-session.entity';
import { UserSessionEntity } from '../entities/user-session.entity';

export class UserSessionMapper {
  static toDomain(entity: UserSessionEntity): UserSession {
    return Object.assign(new UserSession(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      expiresAt: entity.expiresAt,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted; the `user`
  // relation is never set here, only the plain `userId` FK column (see
  // UserSessionEntity).
  static toPersistence(domain: UserSession): UserSessionEntity {
    return Object.assign(new UserSessionEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      expiresAt: domain.expiresAt,
    });
  }
}
