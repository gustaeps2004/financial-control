import { RecurringTransaction } from '../entities/recurring-transaction.entity';

export abstract class RecurringTransactionsRepository {
  abstract findAllByUser(userId: string): Promise<RecurringTransaction[]>;
  abstract findById(id: string): Promise<RecurringTransaction | null>;
  abstract save(
    recurringTransaction: RecurringTransaction,
  ): Promise<RecurringTransaction>;
  abstract remove(recurringTransaction: RecurringTransaction): Promise<void>;
}
