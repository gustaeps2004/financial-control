import { PaymentMethod } from '../../../../../shared/domain/payment/payment-method.enum';
import { Transaction } from '../../../domain/entities/transaction.entity';

export class TransactionResponseDto {
  readonly id: string;
  readonly categoryId: string;
  readonly date: string;
  readonly description: string | null;
  readonly amount: number;
  readonly paymentMethod: PaymentMethod | null;
  readonly cardId: string | null;
  readonly installments: number;
  readonly recurringTransactionId: string | null;
  readonly createdAt?: Date;

  constructor(transaction: Transaction) {
    this.id = transaction.id!;
    this.categoryId = transaction.categoryId;
    this.date = transaction.date;
    this.description = transaction.description;
    this.amount = transaction.amount;
    this.paymentMethod = transaction.paymentMethod;
    this.cardId = transaction.cardId;
    this.installments = transaction.installments;
    this.recurringTransactionId = transaction.recurringTransactionId;
    this.createdAt = transaction.createdAt;
  }
}
