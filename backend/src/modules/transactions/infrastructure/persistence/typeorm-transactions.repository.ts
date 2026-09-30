import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  TransactionFilters,
  TransactionsRepository,
} from '../../domain/repositories/transactions.repository';
import { TransactionEntity } from './entities/transaction.entity';
import { TransactionMapper } from './mappers/transaction.mapper';

@Injectable()
export class TypeOrmTransactionsRepository extends TransactionsRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {
    super();
  }

  async findByUser(
    userId: string,
    filters: TransactionFilters = {},
  ): Promise<Transaction[]> {
    const where: FindOptionsWhere<TransactionEntity> = { userId };
    if (filters.from && filters.to) {
      where.date = Between(filters.from, filters.to);
    } else if (filters.from) {
      where.date = MoreThanOrEqual(filters.from);
    } else if (filters.to) {
      where.date = LessThanOrEqual(filters.to);
    }
    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }
    if (filters.minInstallments) {
      where.installments = MoreThanOrEqual(filters.minInstallments);
    }

    const entities = await this.repository.find({
      where,
      order: { date: 'DESC', createdAt: 'DESC' },
    });
    return entities.map((entity) => TransactionMapper.toDomain(entity));
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const saved = await this.repository.save(
      TransactionMapper.toPersistence(transaction),
    );
    return TransactionMapper.toDomain(saved);
  }

  async remove(transaction: Transaction): Promise<void> {
    await this.repository.softDelete(transaction.id!);
  }
}
