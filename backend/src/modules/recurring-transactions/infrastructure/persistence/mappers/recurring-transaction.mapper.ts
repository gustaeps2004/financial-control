import { YearMonth } from '../../../../../shared/domain/calendar/year-month';
import { RecurringTransaction } from '../../../domain/entities/recurring-transaction.entity';
import { RecurringTransactionEntity } from '../entities/recurring-transaction.entity';

export class RecurringTransactionMapper {
  static toDomain(entity: RecurringTransactionEntity): RecurringTransaction {
    return Object.assign(new RecurringTransaction(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      categoryId: entity.categoryId,
      description: entity.description,
      amount: entity.amount,
      dayOfMonth: entity.dayOfMonth,
      startMonth: YearMonth.fromIsoDate(entity.startMonth),
      endMonth: entity.endMonth ? YearMonth.fromIsoDate(entity.endMonth) : null,
      paymentMethod: entity.paymentMethod,
      cardId: entity.cardId,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(
    domain: RecurringTransaction,
  ): RecurringTransactionEntity {
    return Object.assign(new RecurringTransactionEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      categoryId: domain.categoryId,
      description: domain.description,
      amount: domain.amount,
      dayOfMonth: domain.dayOfMonth,
      startMonth: domain.startMonth.firstDay(),
      endMonth: domain.endMonth ? domain.endMonth.firstDay() : null,
      paymentMethod: domain.paymentMethod,
      cardId: domain.cardId,
    });
  }
}
