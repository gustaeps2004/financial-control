import { StatementPayment } from '../../../domain/entities/statement-payment.entity';

export class StatementPaymentResponseDto {
  readonly id: string;
  readonly cardId: string;
  readonly statementMonth: string;
  readonly paidOn: string;
  readonly amount: number;
  readonly createdAt?: Date;

  constructor(payment: StatementPayment) {
    this.id = payment.id!;
    this.cardId = payment.cardId;
    this.statementMonth = payment.statementMonth.toString();
    this.paidOn = payment.paidOn;
    this.amount = payment.amount;
    this.createdAt = payment.createdAt;
  }
}
