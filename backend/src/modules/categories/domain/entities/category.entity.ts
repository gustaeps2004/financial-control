import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { CategoryKind } from '../enums/category-kind.enum';

export class Category extends BaseDomainEntity {
  userId!: string;
  name!: string;
  kind: CategoryKind = CategoryKind.EXPENSE;
}
