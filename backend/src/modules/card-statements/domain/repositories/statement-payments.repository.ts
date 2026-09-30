import { StatementPayment } from '../entities/statement-payment.entity';

export abstract class StatementPaymentsRepository {
  abstract findAllByUser(userId: string): Promise<StatementPayment[]>;
  abstract findById(id: string): Promise<StatementPayment | null>;
  abstract save(payment: StatementPayment): Promise<StatementPayment>;
  abstract remove(payment: StatementPayment): Promise<void>;
}
