import { YearMonth } from '../../../../../shared/domain/calendar/year-month';
import { StatementPayment } from '../../../domain/entities/statement-payment.entity';
import { StatementPaymentEntity } from '../entities/statement-payment.entity';

export class StatementPaymentMapper {
  static toDomain(entity: StatementPaymentEntity): StatementPayment {
    return Object.assign(new StatementPayment(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      cardId: entity.cardId,
      statementMonth: YearMonth.fromIsoDate(entity.statementMonth),
      paidOn: entity.paidOn,
      amount: entity.amount,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(domain: StatementPayment): StatementPaymentEntity {
    return Object.assign(new StatementPaymentEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      cardId: domain.cardId,
      statementMonth: domain.statementMonth.firstDay(),
      paidOn: domain.paidOn,
      amount: domain.amount,
    });
  }
}
