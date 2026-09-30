import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionEntity } from '../entities/transaction.entity';

export class TransactionMapper {
  static toDomain(entity: TransactionEntity): Transaction {
    return Object.assign(new Transaction(), {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      userId: entity.userId,
      categoryId: entity.categoryId,
      date: entity.date,
      description: entity.description,
      amount: entity.amount,
      paymentMethod: entity.paymentMethod,
      cardId: entity.cardId,
      installments: entity.installments,
      recurringTransactionId: entity.recurringTransactionId,
    });
  }

  // createdAt/updatedAt are DB-managed and intentionally omitted so TypeORM's
  // defaults/triggers own them on both insert and update.
  static toPersistence(domain: Transaction): TransactionEntity {
    return Object.assign(new TransactionEntity(), {
      id: domain.id,
      deletedAt: domain.deletedAt,
      userId: domain.userId,
      categoryId: domain.categoryId,
      date: domain.date,
      description: domain.description,
      amount: domain.amount,
      paymentMethod: domain.paymentMethod,
      cardId: domain.cardId,
      installments: domain.installments,
      recurringTransactionId: domain.recurringTransactionId,
    });
  }
}
