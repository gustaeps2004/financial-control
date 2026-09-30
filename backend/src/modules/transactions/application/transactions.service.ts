import { Injectable } from '@nestjs/common';
import { assertValidPayment } from '../../../shared/domain/payment/payment-rules';
import { CardsService } from '../../cards/application/cards.service';
import { CategoriesService } from '../../categories/application/categories.service';
import { Category } from '../../categories/domain/entities/category.entity';
import { RecurringTransactionsService } from '../../recurring-transactions/application/recurring-transactions.service';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionNotFoundException } from '../domain/exceptions/transaction-not-found.exception';
import {
  TransactionFilters,
  TransactionsRepository,
} from '../domain/repositories/transactions.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

function normalizeDescription(
  description: string | null | undefined,
): string | null {
  return description ? description : null;
}

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly categoriesService: CategoriesService,
    private readonly cardsService: CardsService,
    private readonly recurringTransactionsService: RecurringTransactionsService,
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDto,
  ): Promise<Transaction> {
    const cardId = dto.cardId ?? null;
    const recurringTransactionId = dto.recurringTransactionId ?? null;

    const [category] = await Promise.all([
      this.categoriesService.getOwned(userId, dto.categoryId),
      cardId ? this.cardsService.getOwned(userId, cardId) : null,
      recurringTransactionId
        ? this.recurringTransactionsService.getOwned(
            userId,
            recurringTransactionId,
          )
        : null,
    ]);

    const transaction = Object.assign(new Transaction(), {
      userId,
      categoryId: category.id!,
      date: dto.date,
      description: normalizeDescription(dto.description),
      amount: dto.amount,
      paymentMethod: dto.paymentMethod ?? null,
      cardId,
      installments: dto.installments ?? 1,
      recurringTransactionId,
    });
    this.assertConsistent(transaction, category);

    return this.transactionsRepository.save(transaction);
  }

  findAll(
    userId: string,
    filters: TransactionFilters = {},
  ): Promise<Transaction[]> {
    return this.transactionsRepository.findByUser(userId, filters);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.getOwned(userId, id);

    // Newly picked references must be active; ones already on the
    // transaction only need to still belong to the user.
    const categoryChanged =
      dto.categoryId !== undefined && dto.categoryId !== transaction.categoryId;
    const cardChanged = !!dto.cardId && dto.cardId !== transaction.cardId;
    const recurringChanged =
      !!dto.recurringTransactionId &&
      dto.recurringTransactionId !== transaction.recurringTransactionId;

    const [category] = await Promise.all([
      this.categoriesService.getOwned(
        userId,
        dto.categoryId ?? transaction.categoryId,
        { includeDeleted: !categoryChanged },
      ),
      cardChanged ? this.cardsService.getOwned(userId, dto.cardId!) : null,
      recurringChanged
        ? this.recurringTransactionsService.getOwned(
            userId,
            dto.recurringTransactionId!,
          )
        : null,
    ]);

    if (dto.categoryId !== undefined) transaction.categoryId = dto.categoryId;
    if (dto.date !== undefined) transaction.date = dto.date;
    if (dto.description !== undefined)
      transaction.description = normalizeDescription(dto.description);
    if (dto.amount !== undefined) transaction.amount = dto.amount;
    if (dto.paymentMethod !== undefined)
      transaction.paymentMethod = dto.paymentMethod;
    if (dto.cardId !== undefined) transaction.cardId = dto.cardId;
    if (dto.installments !== undefined)
      transaction.installments = dto.installments;
    if (dto.recurringTransactionId !== undefined)
      transaction.recurringTransactionId = dto.recurringTransactionId;

    this.assertConsistent(transaction, category);

    return this.transactionsRepository.save(transaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    const transaction = await this.getOwned(userId, id);
    await this.transactionsRepository.remove(transaction);
  }

  private async getOwned(userId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findById(id);
    if (!transaction || transaction.userId !== userId) {
      throw new TransactionNotFoundException();
    }
    return transaction;
  }

  private assertConsistent(transaction: Transaction, category: Category): void {
    assertValidPayment({
      paymentMethod: transaction.paymentMethod,
      cardId: transaction.cardId,
      installments: transaction.installments,
      amount: transaction.amount,
      category,
    });
  }
}
