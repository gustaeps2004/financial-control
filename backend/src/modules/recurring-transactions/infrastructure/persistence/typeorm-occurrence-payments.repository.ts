import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { OccurrencePayment } from '../../domain/entities/occurrence-payment.entity';
import { OccurrencePaymentsRepository } from '../../domain/repositories/occurrence-payments.repository';
import { OccurrencePaymentEntity } from './entities/occurrence-payment.entity';
import { OccurrencePaymentMapper } from './mappers/occurrence-payment.mapper';

@Injectable()
export class TypeOrmOccurrencePaymentsRepository extends OccurrencePaymentsRepository {
  constructor(
    @InjectRepository(OccurrencePaymentEntity)
    private readonly repository: Repository<OccurrencePaymentEntity>,
  ) {
    super();
  }

  async findAllByUser(userId: string): Promise<OccurrencePayment[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { month: 'ASC' },
    });
    return entities.map((entity) => OccurrencePaymentMapper.toDomain(entity));
  }

  // The unique index on the occurrence turns a second mark — a double click,
  // another tab — into a no-op instead of an error.
  async add(payment: OccurrencePayment): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .insert()
      .into(OccurrencePaymentEntity)
      .values(OccurrencePaymentMapper.toPersistence(payment))
      .orIgnore()
      .execute();
  }

  async remove(
    recurringTransactionId: string,
    month: YearMonth,
  ): Promise<void> {
    await this.repository.softDelete({
      recurringTransactionId,
      month: month.firstDay(),
      deletedAt: IsNull(),
    });
  }
}
