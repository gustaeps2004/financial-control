import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../../shared/domain/payment/payment-method.enum';

export const MAX_INSTALLMENTS = 48;

/**
 * Something that happened on a given day: money in, money out or money set
 * aside. What it means for the month comes from its category's kind.
 */
export class Transaction extends BaseDomainEntity {
  userId!: string;
  categoryId!: string;
  date!: string; // YYYY-MM-DD
  description: string | null = null;
  // Negative amounts are refunds or withdrawals (e.g. taking money back out
  // of savings).
  amount!: number;
  paymentMethod: PaymentMethod | null = null;
  // The card charged, or for other methods the institution the money left.
  cardId: string | null = null;
  // Credit purchases only; each installment lands on a later statement.
  installments = 1;
  // Set when this transaction is the actual value of a recurring one for
  // its month, which then stops being posted automatically.
  recurringTransactionId: string | null = null;

  get month(): YearMonth {
    return YearMonth.fromIsoDate(this.date);
  }
}
