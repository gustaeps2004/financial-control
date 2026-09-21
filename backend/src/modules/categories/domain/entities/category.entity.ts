import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';

export class Category extends BaseDomainEntity {
  userId!: string;
  name!: string;
}
