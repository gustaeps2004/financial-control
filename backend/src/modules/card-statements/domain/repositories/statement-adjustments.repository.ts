import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { StatementAdjustment } from '../entities/statement-adjustment.entity';

export abstract class StatementAdjustmentsRepository {
  abstract findAllByUser(userId: string): Promise<StatementAdjustment[]>;
  abstract findByCardAndMonth(
    cardId: string,
    statementMonth: YearMonth,
  ): Promise<StatementAdjustment | null>;
  abstract save(adjustment: StatementAdjustment): Promise<StatementAdjustment>;
  abstract remove(adjustment: StatementAdjustment): Promise<void>;
}
