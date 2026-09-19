import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';

export class UserSession extends BaseDomainEntity {
  userId!: string;
  expiresAt!: Date;
}
