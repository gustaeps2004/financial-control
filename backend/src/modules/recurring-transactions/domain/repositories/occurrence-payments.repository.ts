import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { OccurrencePayment } from '../entities/occurrence-payment.entity';

export abstract class OccurrencePaymentsRepository {
  abstract findAllByUser(userId: string): Promise<OccurrencePayment[]>;
  // Both are idempotent: marking a month that is already paid, or clearing
  // one that isn't, changes nothing.
  abstract add(payment: OccurrencePayment): Promise<void>;
  abstract remove(
    recurringTransactionId: string,
    month: YearMonth,
  ): Promise<void>;
}
