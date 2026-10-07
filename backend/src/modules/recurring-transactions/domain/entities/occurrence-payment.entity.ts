import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';

/**
 * Says that a recurring transaction's occurrence in a month was paid — a
 * checklist for bills paid outside the app: a boleto, a Pix, a transfer
 * from another bank's app. It changes no total: reports already count every
 * occurrence of a month that has arrived, paid or not.
 */
export class OccurrencePayment extends BaseDomainEntity {
  userId!: string;
  recurringTransactionId!: string;
  month!: YearMonth;
}
