import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { StatementAdjustment } from '../../domain/entities/statement-adjustment.entity';
import { StatementAdjustmentsRepository } from '../../domain/repositories/statement-adjustments.repository';
import { StatementAdjustmentEntity } from './entities/statement-adjustment.entity';
import { StatementAdjustmentMapper } from './mappers/statement-adjustment.mapper';

@Injectable()
export class TypeOrmStatementAdjustmentsRepository extends StatementAdjustmentsRepository {
  constructor(
    @InjectRepository(StatementAdjustmentEntity)
    private readonly repository: Repository<StatementAdjustmentEntity>,
  ) {
    super();
  }

  async findAllByUser(userId: string): Promise<StatementAdjustment[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { statementMonth: 'ASC' },
    });
    return entities.map((entity) => StatementAdjustmentMapper.toDomain(entity));
  }

  async findByCardAndMonth(
    cardId: string,
    statementMonth: YearMonth,
  ): Promise<StatementAdjustment | null> {
    const entity = await this.repository.findOne({
      where: { cardId, statementMonth: statementMonth.firstDay() },
    });
    return entity ? StatementAdjustmentMapper.toDomain(entity) : null;
  }

  async save(adjustment: StatementAdjustment): Promise<StatementAdjustment> {
    const saved = await this.repository.save(
      StatementAdjustmentMapper.toPersistence(adjustment),
    );
    return StatementAdjustmentMapper.toDomain(saved);
  }

  async remove(adjustment: StatementAdjustment): Promise<void> {
    await this.repository.softDelete(adjustment.id!);
  }
}
