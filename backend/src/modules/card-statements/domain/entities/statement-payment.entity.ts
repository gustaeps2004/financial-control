import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';

/**
 * Money that left the account to pay a card statement. Purchases were
 * already counted as spending when made; this is what counts as cash out.
 */
export class StatementPayment extends BaseDomainEntity {
  userId!: string;
  cardId!: string;
  statementMonth!: YearMonth;
  paidOn!: string; // YYYY-MM-DD
  amount!: number;
}
