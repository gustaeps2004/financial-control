import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';

export class Card extends BaseDomainEntity {
  userId!: string;
  brand!: string;
  mark!: string;
  swatch!: string;
  nickname!: string;
  creditLimit!: number;
  closingDay!: number;
  openingBalance!: number;
}
