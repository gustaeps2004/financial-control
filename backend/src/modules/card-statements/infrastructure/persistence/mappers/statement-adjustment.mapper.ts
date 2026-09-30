import { YearMonth } from '../../../../../shared/domain/calendar/year-month';
import { StatementAdjustment } from '../../../domain/entities/statement-adjustment.entity';
import { StatementAdjustmentEntity } from '../entities/statement-adjustment.entity';

export class StatementAdjustmentMapper {
  static toDomain(entity: StatementAdjustmentEntity): StatementAdjustment {
    return Object.assign(new StatementAdjustment(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      cardId: entity.cardId,
      statementMonth: YearMonth.fromIsoDate(entity.statementMonth),
      amount: entity.amount,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(domain: StatementAdjustment): StatementAdjustmentEntity {
    return Object.assign(new StatementAdjustmentEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      cardId: domain.cardId,
      statementMonth: domain.statementMonth.firstDay(),
      amount: domain.amount,
    });
  }
}
