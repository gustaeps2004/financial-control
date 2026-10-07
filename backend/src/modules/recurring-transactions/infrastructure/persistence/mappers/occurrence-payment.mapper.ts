import { YearMonth } from '../../../../../shared/domain/calendar/year-month';
import { OccurrencePayment } from '../../../domain/entities/occurrence-payment.entity';
import { OccurrencePaymentEntity } from '../entities/occurrence-payment.entity';

export class OccurrencePaymentMapper {
  static toDomain(entity: OccurrencePaymentEntity): OccurrencePayment {
    return Object.assign(new OccurrencePayment(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      recurringTransactionId: entity.recurringTransactionId,
      month: YearMonth.fromIsoDate(entity.month),
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(domain: OccurrencePayment): OccurrencePaymentEntity {
    return Object.assign(new OccurrencePaymentEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      recurringTransactionId: domain.recurringTransactionId,
      month: domain.month.firstDay(),
    });
  }
}
