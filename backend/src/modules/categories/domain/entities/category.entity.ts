import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { CategoryKind } from '../enums/category-kind.enum';

export class Category extends BaseDomainEntity {
  userId!: string;
  name!: string;
  kind: CategoryKind = CategoryKind.EXPENSE;

  // Only spending can go on a credit card; income or savings "paid by
  // credit" would be counted twice once the card bill is paid.
  acceptsCreditCard(): boolean {
    return (
      this.kind === CategoryKind.EXPENSE ||
      this.kind === CategoryKind.FIXED_BILL
    );
  }
}
