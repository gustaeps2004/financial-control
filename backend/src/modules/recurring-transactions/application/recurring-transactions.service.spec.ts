import { Test, TestingModule } from '@nestjs/testing';
import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import {
  CreditPaymentNotAllowedException,
  CreditPaymentRequiresCardException,
} from '../../../shared/domain/payment/payment-rules';
import { CardsService } from '../../cards/application/cards.service';
import { Card } from '../../cards/domain/entities/card.entity';
import { CardNotFoundException } from '../../cards/domain/exceptions/card-not-found.exception';
import { CategoriesService } from '../../categories/application/categories.service';
import { Category } from '../../categories/domain/entities/category.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { RecurringTransaction } from '../domain/entities/recurring-transaction.entity';
import { InvalidRecurringPeriodException } from '../domain/exceptions/invalid-recurring-period.exception';
import { RecurringTransactionNotFoundException } from '../domain/exceptions/recurring-transaction-not-found.exception';
import { OccurrencePaymentsRepository } from '../domain/repositories/occurrence-payments.repository';
import { RecurringTransactionsRepository } from '../domain/repositories/recurring-transactions.repository';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { RecurringTransactionsService } from './recurring-transactions.service';

describe('RecurringTransactionsService', () => {
  let service: RecurringTransactionsService;
  let repository: jest.Mocked<RecurringTransactionsRepository>;
  let paymentsRepository: jest.Mocked<OccurrencePaymentsRepository>;
  let categoriesService: jest.Mocked<CategoriesService>;
  let cardsService: jest.Mocked<CardsService>;

  const userId = 'user-1';
  const internetCategory = Object.assign(new Category(), {
    id: 'cat-internet',
    userId,
    name: 'Internet',
    kind: CategoryKind.FIXED_BILL,
  });
  const salaryCategory = Object.assign(new Category(), {
    id: 'cat-salary',
    userId,
    name: 'Salary',
    kind: CategoryKind.INCOME,
  });
  const dto: CreateRecurringTransactionDto = {
    categoryId: internetCategory.id,
    description: 'Internet',
    amount: 149.91,
    dayOfMonth: 6,
    startMonth: '2026-09',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringTransactionsService,
        {
          provide: RecurringTransactionsRepository,
          useValue: {
            findAllByUser: jest.fn(),
            findById: jest.fn(),
            save: jest.fn((recurring: RecurringTransaction) =>
              Promise.resolve(recurring),
            ),
            remove: jest.fn(),
          },
        },
        {
          provide: OccurrencePaymentsRepository,
          useValue: {
            findAllByUser: jest.fn(),
            add: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: { getOwned: jest.fn() },
        },
        {
          provide: CardsService,
          useValue: { getOwned: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(RecurringTransactionsService);
    repository = module.get(RecurringTransactionsRepository);
    paymentsRepository = module.get(OccurrencePaymentsRepository);
    categoriesService = module.get(CategoriesService);
    cardsService = module.get(CardsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates an open-ended recurring transaction', async () => {
      categoriesService.getOwned.mockResolvedValue(internetCategory);

      const result = await service.create(userId, dto);

      expect(result).toMatchObject({
        userId,
        categoryId: 'cat-internet',
        amount: 149.91,
        dayOfMonth: 6,
        endMonth: null,
        paymentMethod: null,
        cardId: null,
      });
      expect(result.startMonth.toString()).toBe('2026-09');
    });

    it('accepts a subscription charged to a card', async () => {
      categoriesService.getOwned.mockResolvedValue(internetCategory);
      cardsService.getOwned.mockResolvedValue(
        Object.assign(new Card(), { id: 'card-1', userId }),
      );

      const result = await service.create(userId, {
        ...dto,
        paymentMethod: PaymentMethod.CREDIT,
        cardId: 'card-1',
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(cardsService.getOwned).toHaveBeenCalledWith(userId, 'card-1');
      expect(result.cardId).toBe('card-1');
    });

    it('rejects a card the user does not own', async () => {
      categoriesService.getOwned.mockResolvedValue(internetCategory);
      cardsService.getOwned.mockRejectedValue(new CardNotFoundException());

      await expect(
        service.create(userId, { ...dto, cardId: 'card-x' }),
      ).rejects.toThrow(CardNotFoundException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects an end month before the start month', async () => {
      categoriesService.getOwned.mockResolvedValue(internetCategory);

      await expect(
        service.create(userId, { ...dto, endMonth: '2026-08' }),
      ).rejects.toThrow(InvalidRecurringPeriodException);
    });

    it('rejects credit without a card', async () => {
      categoriesService.getOwned.mockResolvedValue(internetCategory);

      await expect(
        service.create(userId, { ...dto, paymentMethod: PaymentMethod.CREDIT }),
      ).rejects.toThrow(CreditPaymentRequiresCardException);
    });

    it('rejects charging an income to a card', async () => {
      categoriesService.getOwned.mockResolvedValue(salaryCategory);
      cardsService.getOwned.mockResolvedValue(
        Object.assign(new Card(), { id: 'card-1', userId }),
      );

      await expect(
        service.create(userId, {
          ...dto,
          categoryId: salaryCategory.id,
          paymentMethod: PaymentMethod.CREDIT,
          cardId: 'card-1',
        }),
      ).rejects.toThrow(CreditPaymentNotAllowedException);
    });
  });

  describe('update', () => {
    function existing(): RecurringTransaction {
      return Object.assign(new RecurringTransaction(), {
        id: 'rec-1',
        userId,
        categoryId: internetCategory.id,
        description: 'Internet',
        amount: 149.91,
        dayOfMonth: 6,
        startMonth: YearMonth.parse('2026-09'),
        endMonth: null,
        paymentMethod: null,
        cardId: null,
      });
    }

    it('ends a recurring transaction and still accepts its deleted category', async () => {
      repository.findById.mockResolvedValue(existing());
      categoriesService.getOwned.mockResolvedValue(internetCategory);

      const result = await service.update(userId, 'rec-1', {
        endMonth: '2026-12',
        amount: 159.9,
      });

      expect(result.endMonth?.toString()).toBe('2026-12');
      expect(result.amount).toBe(159.9);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(categoriesService.getOwned).toHaveBeenCalledWith(
        userId,
        internetCategory.id,
        { includeDeleted: true },
      );
    });

    it('requires a newly picked category to be active', async () => {
      repository.findById.mockResolvedValue(existing());
      categoriesService.getOwned.mockResolvedValue(salaryCategory);

      await service.update(userId, 'rec-1', { categoryId: 'cat-salary' });

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(categoriesService.getOwned).toHaveBeenCalledWith(
        userId,
        'cat-salary',
        { includeDeleted: false },
      );
    });

    it('clears the end month with null', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(existing(), { endMonth: YearMonth.parse('2026-12') }),
      );
      categoriesService.getOwned.mockResolvedValue(internetCategory);

      const result = await service.update(userId, 'rec-1', { endMonth: null });

      expect(result.endMonth).toBeNull();
    });

    it('hides recurring transactions owned by another user', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(existing(), { userId: 'someone-else' }),
      );

      await expect(
        service.update(userId, 'rec-1', { amount: 1 }),
      ).rejects.toThrow(RecurringTransactionNotFoundException);
    });
  });

  describe('remove', () => {
    it('removes a recurring transaction owned by the user', async () => {
      const recurring = Object.assign(new RecurringTransaction(), {
        id: 'rec-1',
        userId,
      });
      repository.findById.mockResolvedValue(recurring);

      await service.remove(userId, 'rec-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.remove).toHaveBeenCalledWith(recurring);
    });
  });

  describe('paid marks', () => {
    const october = YearMonth.parse('2026-10');

    it('marks the month of a recurring transaction paid', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(new RecurringTransaction(), { id: 'rec-1', userId }),
      );

      await service.markPaid(userId, 'rec-1', october);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(paymentsRepository.add).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          recurringTransactionId: 'rec-1',
          month: october,
        }),
      );
    });

    it('marks it unpaid again', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(new RecurringTransaction(), { id: 'rec-1', userId }),
      );

      await service.markUnpaid(userId, 'rec-1', october);

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(paymentsRepository.remove).toHaveBeenCalledWith('rec-1', october);
    });

    it("leaves another user's recurring transactions alone", async () => {
      repository.findById.mockResolvedValue(
        Object.assign(new RecurringTransaction(), {
          id: 'rec-1',
          userId: 'someone-else',
        }),
      );

      await expect(service.markPaid(userId, 'rec-1', october)).rejects.toThrow(
        RecurringTransactionNotFoundException,
      );
      await expect(
        service.markUnpaid(userId, 'rec-1', october),
      ).rejects.toThrow(RecurringTransactionNotFoundException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(paymentsRepository.add).not.toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(paymentsRepository.remove).not.toHaveBeenCalled();
    });
  });
});
