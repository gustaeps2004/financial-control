import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../../shared/domain/payment/payment-method.enum';

/**
 * Something that happens every month (a bill, a subscription, a salary) and
 * is therefore posted automatically: each month in its validity window gets
 * one occurrence, unless a transaction logged by hand replaces it.
 */
export class RecurringTransaction extends BaseDomainEntity {
  userId!: string;
  categoryId!: string;
  description!: string;
  amount!: number;
  dayOfMonth!: number;
  startMonth!: YearMonth;
  // null means it keeps repeating with no end.
  endMonth: YearMonth | null = null;
  paymentMethod: PaymentMethod | null = null;
  cardId: string | null = null;

  isActiveIn(month: YearMonth): boolean {
    return (
      !month.isBefore(this.startMonth) &&
      (this.endMonth === null || !month.isAfter(this.endMonth))
    );
  }

  /** Days past the end of a short month fall on its last day. */
  occurrenceDateIn(month: YearMonth): string {
    return month.dateOn(this.dayOfMonth);
  }
}
