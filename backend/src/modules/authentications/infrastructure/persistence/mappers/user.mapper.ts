import { User } from '../../../domain/entities/user.entity';
import { UserEntity } from '../entities/user.entity';

export class UserMapper {
  static toDomain(entity: UserEntity): User {
    return Object.assign(new User(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      username: entity.username,
      email: entity.email,
      name: entity.name,
      emailConfirmed: entity.emailConfirmed,
      password: entity.password,
      provider: entity.provider,
      providerId: entity.providerId,
      privacyPolicyAccepted: entity.privacyPolicyAccepted,
      termsOfUseAccepted: entity.termsOfUseAccepted,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(domain: User): UserEntity {
    return Object.assign(new UserEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      username: domain.username,
      email: domain.email,
      name: domain.name,
      emailConfirmed: domain.emailConfirmed,
      password: domain.password,
      provider: domain.provider,
      providerId: domain.providerId,
      privacyPolicyAccepted: domain.privacyPolicyAccepted,
      termsOfUseAccepted: domain.termsOfUseAccepted,
    });
  }
}
