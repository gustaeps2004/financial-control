import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';

export class UserSession extends BaseDomainEntity {
  userId!: string;
  token!: string;
  ipAddress: string | null = null;
  userAgent: string | null = null;
  expiresAt!: Date;
  revokedAt: Date | null = null;
}
