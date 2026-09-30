import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringTransaction } from '../../domain/entities/recurring-transaction.entity';
import { RecurringTransactionsRepository } from '../../domain/repositories/recurring-transactions.repository';
import { RecurringTransactionEntity } from './entities/recurring-transaction.entity';
import { RecurringTransactionMapper } from './mappers/recurring-transaction.mapper';

@Injectable()
export class TypeOrmRecurringTransactionsRepository extends RecurringTransactionsRepository {
  constructor(
    @InjectRepository(RecurringTransactionEntity)
    private readonly repository: Repository<RecurringTransactionEntity>,
  ) {
    super();
  }

  async findAllByUser(userId: string): Promise<RecurringTransaction[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { dayOfMonth: 'ASC', description: 'ASC' },
    });
    return entities.map((entity) =>
      RecurringTransactionMapper.toDomain(entity),
    );
  }

  async findById(id: string): Promise<RecurringTransaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? RecurringTransactionMapper.toDomain(entity) : null;
  }

  async save(
    recurringTransaction: RecurringTransaction,
  ): Promise<RecurringTransaction> {
    const saved = await this.repository.save(
      RecurringTransactionMapper.toPersistence(recurringTransaction),
    );
    return RecurringTransactionMapper.toDomain(saved);
  }

  async remove(recurringTransaction: RecurringTransaction): Promise<void> {
    await this.repository.softDelete(recurringTransaction.id!);
  }
}
