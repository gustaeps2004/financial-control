import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';

/**
 * What a statement already carries that was never logged as a purchase in
 * the app: installments of older purchases, subscriptions, fees. There is at
 * most one per card and statement month.
 */
export class StatementAdjustment extends BaseDomainEntity {
  userId!: string;
  cardId!: string;
  statementMonth!: YearMonth;
  // Negative for credits on the statement.
  amount!: number;
}
