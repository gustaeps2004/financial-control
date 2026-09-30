import { Injectable } from '@nestjs/common';
import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { assertValidPayment } from '../../../shared/domain/payment/payment-rules';
import { CardsService } from '../../cards/application/cards.service';
import { CategoriesService } from '../../categories/application/categories.service';
import { Category } from '../../categories/domain/entities/category.entity';
import { RecurringTransaction } from '../domain/entities/recurring-transaction.entity';
import { InvalidRecurringPeriodException } from '../domain/exceptions/invalid-recurring-period.exception';
import { RecurringTransactionNotFoundException } from '../domain/exceptions/recurring-transaction-not-found.exception';
import { RecurringTransactionsRepository } from '../domain/repositories/recurring-transactions.repository';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    private readonly recurringTransactionsRepository: RecurringTransactionsRepository,
    private readonly categoriesService: CategoriesService,
    private readonly cardsService: CardsService,
  ) {}

  async create(
    userId: string,
    dto: CreateRecurringTransactionDto,
  ): Promise<RecurringTransaction> {
    const category = await this.categoriesService.getOwned(
      userId,
      dto.categoryId,
    );
    const cardId = dto.cardId ?? null;
    if (cardId) {
      await this.cardsService.getOwned(userId, cardId);
    }

    const recurringTransaction = Object.assign(new RecurringTransaction(), {
      userId,
      categoryId: category.id!,
      description: dto.description,
      amount: dto.amount,
      dayOfMonth: dto.dayOfMonth,
      startMonth: YearMonth.parse(dto.startMonth),
      endMonth: dto.endMonth ? YearMonth.parse(dto.endMonth) : null,
      paymentMethod: dto.paymentMethod ?? null,
      cardId,
    });
    this.assertConsistent(recurringTransaction, category);

    return this.recurringTransactionsRepository.save(recurringTransaction);
  }

  findAll(userId: string): Promise<RecurringTransaction[]> {
    return this.recurringTransactionsRepository.findAllByUser(userId);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateRecurringTransactionDto,
  ): Promise<RecurringTransaction> {
    const recurringTransaction = await this.getOwned(userId, id);

    // A newly picked category or card must be active; one that is already
    // referenced only needs to still belong to the user.
    const categoryChanged =
      dto.categoryId !== undefined &&
      dto.categoryId !== recurringTransaction.categoryId;
    const category = await this.categoriesService.getOwned(
      userId,
      dto.categoryId ?? recurringTransaction.categoryId,
      { includeDeleted: !categoryChanged },
    );
    if (dto.cardId && dto.cardId !== recurringTransaction.cardId) {
      await this.cardsService.getOwned(userId, dto.cardId);
    }

    if (dto.categoryId !== undefined)
      recurringTransaction.categoryId = dto.categoryId;
    if (dto.description !== undefined)
      recurringTransaction.description = dto.description;
    if (dto.amount !== undefined) recurringTransaction.amount = dto.amount;
    if (dto.dayOfMonth !== undefined)
      recurringTransaction.dayOfMonth = dto.dayOfMonth;
    if (dto.startMonth !== undefined)
      recurringTransaction.startMonth = YearMonth.parse(dto.startMonth);
    if (dto.endMonth !== undefined)
      recurringTransaction.endMonth = dto.endMonth
        ? YearMonth.parse(dto.endMonth)
        : null;
    if (dto.paymentMethod !== undefined)
      recurringTransaction.paymentMethod = dto.paymentMethod;
    if (dto.cardId !== undefined) recurringTransaction.cardId = dto.cardId;

    this.assertConsistent(recurringTransaction, category);

    return this.recurringTransactionsRepository.save(recurringTransaction);
  }

  async remove(userId: string, id: string): Promise<void> {
    const recurringTransaction = await this.getOwned(userId, id);
    await this.recurringTransactionsRepository.remove(recurringTransaction);
  }

  /** Public lookup for other modules. */
  async getOwned(userId: string, id: string): Promise<RecurringTransaction> {
    const recurringTransaction =
      await this.recurringTransactionsRepository.findById(id);
    if (!recurringTransaction || recurringTransaction.userId !== userId) {
      throw new RecurringTransactionNotFoundException();
    }
    return recurringTransaction;
  }

  private assertConsistent(
    recurringTransaction: RecurringTransaction,
    category: Category,
  ): void {
    const { startMonth, endMonth } = recurringTransaction;
    if (endMonth && endMonth.isBefore(startMonth)) {
      throw new InvalidRecurringPeriodException();
    }
    assertValidPayment({
      paymentMethod: recurringTransaction.paymentMethod,
      cardId: recurringTransaction.cardId,
      amount: recurringTransaction.amount,
      category,
    });
  }
}
