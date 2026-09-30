import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatementPayment } from '../../domain/entities/statement-payment.entity';
import { StatementPaymentsRepository } from '../../domain/repositories/statement-payments.repository';
import { StatementPaymentEntity } from './entities/statement-payment.entity';
import { StatementPaymentMapper } from './mappers/statement-payment.mapper';

@Injectable()
export class TypeOrmStatementPaymentsRepository extends StatementPaymentsRepository {
  constructor(
    @InjectRepository(StatementPaymentEntity)
    private readonly repository: Repository<StatementPaymentEntity>,
  ) {
    super();
  }

  async findAllByUser(userId: string): Promise<StatementPayment[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { paidOn: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((entity) => StatementPaymentMapper.toDomain(entity));
  }

  async findById(id: string): Promise<StatementPayment | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? StatementPaymentMapper.toDomain(entity) : null;
  }

  async save(payment: StatementPayment): Promise<StatementPayment> {
    const saved = await this.repository.save(
      StatementPaymentMapper.toPersistence(payment),
    );
    return StatementPaymentMapper.toDomain(saved);
  }

  async remove(payment: StatementPayment): Promise<void> {
    await this.repository.softDelete(payment.id!);
  }
}
