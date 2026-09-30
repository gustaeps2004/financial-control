import { PaymentMethod } from '../../../../../shared/domain/payment/payment-method.enum';
import { RecurringTransaction } from '../../../domain/entities/recurring-transaction.entity';

export class RecurringTransactionResponseDto {
  readonly id: string;
  readonly categoryId: string;
  readonly description: string;
  readonly amount: number;
  readonly dayOfMonth: number;
  readonly startMonth: string;
  readonly endMonth: string | null;
  readonly paymentMethod: PaymentMethod | null;
  readonly cardId: string | null;
  readonly createdAt?: Date;

  constructor(recurringTransaction: RecurringTransaction) {
    this.id = recurringTransaction.id!;
    this.categoryId = recurringTransaction.categoryId;
    this.description = recurringTransaction.description;
    this.amount = recurringTransaction.amount;
    this.dayOfMonth = recurringTransaction.dayOfMonth;
    this.startMonth = recurringTransaction.startMonth.toString();
    this.endMonth = recurringTransaction.endMonth?.toString() ?? null;
    this.paymentMethod = recurringTransaction.paymentMethod;
    this.cardId = recurringTransaction.cardId;
    this.createdAt = recurringTransaction.createdAt;
  }
}
