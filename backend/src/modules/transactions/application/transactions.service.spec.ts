import { Test, TestingModule } from '@nestjs/testing';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import {
  CreditPaymentRequiresCardException,
  InstallmentsRequireCreditException,
} from '../../../shared/domain/payment/payment-rules';
import { CardsService } from '../../cards/application/cards.service';
import { Card } from '../../cards/domain/entities/card.entity';
import { CategoriesService } from '../../categories/application/categories.service';
import { Category } from '../../categories/domain/entities/category.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { CategoryNotFoundException } from '../../categories/domain/exceptions/category-not-found.exception';
import { RecurringTransactionsService } from '../../recurring-transactions/application/recurring-transactions.service';
import { RecurringTransaction } from '../../recurring-transactions/domain/entities/recurring-transaction.entity';
import { RecurringTransactionNotFoundException } from '../../recurring-transactions/domain/exceptions/recurring-transaction-not-found.exception';
import { Transaction } from '../domain/entities/transaction.entity';
import { TransactionNotFoundException } from '../domain/exceptions/transaction-not-found.exception';
import { TransactionsRepository } from '../domain/repositories/transactions.repository';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionsService } from './transactions.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: jest.Mocked<TransactionsRepository>;
  let categoriesService: jest.Mocked<CategoriesService>;
  let cardsService: jest.Mocked<CardsService>;
  let recurringTransactionsService: jest.Mocked<RecurringTransactionsService>;

  const userId = 'user-1';
  const restaurants = Object.assign(new Category(), {
    id: 'cat-restaurants',
    userId,
    name: 'Restaurants',
    kind: CategoryKind.EXPENSE,
  });
  const itau = Object.assign(new Card(), { id: 'card-itau', userId });
  const dto: CreateTransactionDto = {
    categoryId: 'cat-restaurants',
    date: '2026-09-13',
    description: '  Madero  ',
    amount: 158.4,
    paymentMethod: PaymentMethod.CREDIT,
    cardId: 'card-itau',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: {
            findByUser: jest.fn(),
            findById: jest.fn(),
            save: jest.fn((transaction: Transaction) =>
              Promise.resolve(transaction),
            ),
            remove: jest.fn(),
          },
        },
        { provide: CategoriesService, useValue: { getOwned: jest.fn() } },
        { provide: CardsService, useValue: { getOwned: jest.fn() } },
        {
          provide: RecurringTransactionsService,
          useValue: { getOwned: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(TransactionsService);
    repository = module.get(TransactionsRepository);
    categoriesService = module.get(CategoriesService);
    cardsService = module.get(CardsService);
    recurringTransactionsService = module.get(RecurringTransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('logs a credit card purchase', async () => {
      categoriesService.getOwned.mockResolvedValue(restaurants);
      cardsService.getOwned.mockResolvedValue(itau);

      const result = await service.create(userId, {
        ...dto,
        description: 'Madero',
      });

      expect(result).toMatchObject({
        userId,
        categoryId: 'cat-restaurants',
        date: '2026-09-13',
        description: 'Madero',
        amount: 158.4,
        paymentMethod: PaymentMethod.CREDIT,
        cardId: 'card-itau',
        installments: 1,
        recurringTransactionId: null,
      });
    });

    it('stores an empty description as null', async () => {
      categoriesService.getOwned.mockResolvedValue(restaurants);
      cardsService.getOwned.mockResolvedValue(itau);

      const result = await service.create(userId, { ...dto, description: '' });

      expect(result.description).toBeNull();
    });

    it('splits a credit purchase in installments', async () => {
      categoriesService.getOwned.mockResolvedValue(restaurants);
      cardsService.getOwned.mockResolvedValue(itau);

      const result = await service.create(userId, { ...dto, installments: 10 });

      expect(result.installments).toBe(10);
    });

    it('rejects installments outside credit', async () => {
      categoriesService.getOwned.mockResolvedValue(restaurants);

      await expect(
        service.create(userId, {
          ...dto,
          paymentMethod: PaymentMethod.PIX,
          cardId: null,
          installments: 2,
        }),
      ).rejects.toThrow(InstallmentsRequireCreditException);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('rejects credit without a card', async () => {
      categoriesService.getOwned.mockResolvedValue(restaurants);

      await expect(
        service.create(userId, { ...dto, cardId: null }),
      ).rejects.toThrow(CreditPaymentRequiresCardException);
    });

    it('rejects a category the user does not own', async () => {
      categoriesService.getOwned.mockRejectedValue(
        new CategoryNotFoundException(),
      );
      cardsService.getOwned.mockResolvedValue(itau);

      await expect(service.create(userId, dto)).rejects.toThrow(
        CategoryNotFoundException,
      );
    });

    it('links the actual value of a recurring transaction', async () => {
      categoriesService.getOwned.mockResolvedValue(restaurants);
      recurringTransactionsService.getOwned.mockResolvedValue(
        Object.assign(new RecurringTransaction(), { id: 'rec-1', userId }),
      );

      const result = await service.create(userId, {
        ...dto,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        cardId: null,
        recurringTransactionId: 'rec-1',
      });

      expect(result.recurringTransactionId).toBe('rec-1');
    });

    it('rejects a recurring transaction the user does not own', async () => {
      categoriesService.getOwned.mockResolvedValue(restaurants);
      recurringTransactionsService.getOwned.mockRejectedValue(
        new RecurringTransactionNotFoundException(),
      );

      await expect(
        service.create(userId, {
          ...dto,
          paymentMethod: null,
          cardId: null,
          recurringTransactionId: 'rec-x',
        }),
      ).rejects.toThrow(RecurringTransactionNotFoundException);
    });
  });

  describe('update', () => {
    function existing(): Transaction {
      return Object.assign(new Transaction(), {
        id: 'txn-1',
        userId,
        categoryId: 'cat-restaurants',
        date: '2026-09-13',
        description: 'Madero',
        amount: 158.4,
        paymentMethod: PaymentMethod.CREDIT,
        cardId: 'card-itau',
        installments: 1,
        recurringTransactionId: null,
      });
    }

    it('keeps accepting references that were deleted since', async () => {
      repository.findById.mockResolvedValue(existing());
      categoriesService.getOwned.mockResolvedValue(restaurants);

      const result = await service.update(userId, 'txn-1', { amount: 160 });

      expect(result.amount).toBe(160);
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(categoriesService.getOwned).toHaveBeenCalledWith(
        userId,
        'cat-restaurants',
        { includeDeleted: true },
      );
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(cardsService.getOwned).not.toHaveBeenCalled();
    });

    it('validates a newly picked card', async () => {
      repository.findById.mockResolvedValue(existing());
      categoriesService.getOwned.mockResolvedValue(restaurants);
      cardsService.getOwned.mockResolvedValue(
        Object.assign(new Card(), { id: 'card-nubank', userId }),
      );

      const result = await service.update(userId, 'txn-1', {
        cardId: 'card-nubank',
      });

      expect(result.cardId).toBe('card-nubank');
      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(cardsService.getOwned).toHaveBeenCalledWith(userId, 'card-nubank');
    });

    it('re-validates the payment after the change', async () => {
      repository.findById.mockResolvedValue(existing());
      categoriesService.getOwned.mockResolvedValue(restaurants);

      await expect(
        service.update(userId, 'txn-1', { cardId: null }),
      ).rejects.toThrow(CreditPaymentRequiresCardException);
    });

    it('hides transactions owned by another user', async () => {
      repository.findById.mockResolvedValue(
        Object.assign(existing(), { userId: 'someone-else' }),
      );

      await expect(
        service.update(userId, 'txn-1', { amount: 1 }),
      ).rejects.toThrow(TransactionNotFoundException);
    });
  });

  describe('remove', () => {
    it('removes a transaction owned by the user', async () => {
      const transaction = Object.assign(new Transaction(), {
        id: 'txn-1',
        userId,
      });
      repository.findById.mockResolvedValue(transaction);

      await service.remove(userId, 'txn-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
      expect(repository.remove).toHaveBeenCalledWith(transaction);
    });
  });
});
