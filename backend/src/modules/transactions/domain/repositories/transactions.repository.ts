import { PaymentMethod } from '../../../../shared/domain/payment/payment-method.enum';
import { Transaction } from '../entities/transaction.entity';

export interface TransactionFilters {
  from?: string; // YYYY-MM-DD, inclusive
  to?: string; // YYYY-MM-DD, inclusive
  paymentMethod?: PaymentMethod;
  minInstallments?: number;
}

export abstract class TransactionsRepository {
  abstract findByUser(
    userId: string,
    filters?: TransactionFilters,
  ): Promise<Transaction[]>;
  abstract findById(id: string): Promise<Transaction | null>;
  abstract save(transaction: Transaction): Promise<Transaction>;
  abstract remove(transaction: Transaction): Promise<void>;
}
