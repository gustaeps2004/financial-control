import { Test, TestingModule } from '@nestjs/testing';
import { Clock } from '../../../shared/clock/clock';
import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import { CardStatementsService } from '../../card-statements/application/card-statements.service';
import { CardsService } from '../../cards/application/cards.service';
import { Card } from '../../cards/domain/entities/card.entity';
import { CardNotFoundException } from '../../cards/domain/exceptions/card-not-found.exception';
import { CategoriesService } from '../../categories/application/categories.service';
import { Category } from '../../categories/domain/entities/category.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { RecurringTransactionsService } from '../../recurring-transactions/application/recurring-transactions.service';
import { OccurrencePayment } from '../../recurring-transactions/domain/entities/occurrence-payment.entity';
import { RecurringTransaction } from '../../recurring-transactions/domain/entities/recurring-transaction.entity';
import { TransactionsService } from '../../transactions/application/transactions.service';
import { Transaction } from '../../transactions/domain/entities/transaction.entity';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let categoriesService: jest.Mocked<CategoriesService>;
  let recurringTransactionsService: jest.Mocked<RecurringTransactionsService>;
  let transactionsService: jest.Mocked<TransactionsService>;

  const userId = 'user-1';
  const groceries = Object.assign(new Category(), {
    id: 'cat-groceries',
    userId,
    name: 'Groceries',
    kind: CategoryKind.EXPENSE,
    deletedAt: null,
  });
  const nubank = Object.assign(new Card(), {
    id: 'card-nubank',
    userId,
    nickname: 'Nubank',
    brand: 'Nubank',
    mark: 'NU',
    swatch: '#423a6a',
    creditLimit: 5000,
    closingDay: 3,
    dueDay: 10,
    deletedAt: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: Clock, useValue: { today: () => '2026-09-30' } },
        {
          provide: CategoriesService,
          useValue: {
            findAllIncludingDeleted: jest.fn().mockResolvedValue([groceries]),
          },
        },
        {
          provide: CardsService,
          useValue: {
            findAllIncludingDeleted: jest.fn().mockResolvedValue([nubank]),
          },
        },
        {
          provide: RecurringTransactionsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            listOccurrencePayments: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: CardStatementsService,
          useValue: {
            listAdjustments: jest.fn().mockResolvedValue([]),
            listPayments: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: TransactionsService,
          useValue: { findAll: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    service = module.get(ReportsService);
    categoriesService = module.get(CategoriesService);
    recurringTransactionsService = module.get(RecurringTransactionsService);
    transactionsService = module.get(TransactionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('also loads the months and installment purchases that reach the range', async () => {
    await service.summary(userId, {
      type: 'MONTH',
      month: YearMonth.parse('2026-10'),
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
    expect(transactionsService.findAll).toHaveBeenCalledWith(userId, {
      from: '2026-08-01',
      to: '2026-10-31',
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
    expect(transactionsService.findAll).toHaveBeenCalledWith(userId, {
      from: '2022-08-01',
      to: '2026-07-31',
      paymentMethod: PaymentMethod.CREDIT,
      minInstallments: 2,
    });
  });

  it('puts an old installment purchase on the statements it still reaches', async () => {
    transactionsService.findAll.mockImplementation((_userId, filters) =>
      Promise.resolve(
        filters?.minInstallments
          ? [
              Object.assign(new Transaction(), {
                id: 'txn-fridge',
                userId,
                categoryId: groceries.id,
                date: '2026-05-20',
                description: 'Fridge',
                amount: 1200,
                paymentMethod: PaymentMethod.CREDIT,
                cardId: nubank.id,
                installments: 10,
                recurringTransactionId: null,
              }),
            ]
          : [],
      ),
    );

    const detail = await service.cardStatement(
      userId,
      nubank.id,
      YearMonth.parse('2026-10'),
    );

    // Bought after the 3rd of May: 1st installment on the June statement,
    // so October carries the 5th of 10.
    expect(detail.charges).toEqual([
      expect.objectContaining({
        installment: 5,
        installments: 10,
        amount: 120,
      }),
    ]);
    // Today (Sep 30th) is inside October's cycle (Sep 4th to Oct 3rd).
    expect(detail.statement).toMatchObject({
      installments: 120,
      total: 120,
      status: 'OPEN',
    });
  });

  it('reports everything from the first record on when no period is given', async () => {
    transactionsService.findAll.mockResolvedValue([
      Object.assign(new Transaction(), {
        id: 'txn-old',
        userId,
        categoryId: groceries.id,
        date: '2025-03-15',
        description: null,
        amount: 80,
        paymentMethod: PaymentMethod.PIX,
        cardId: null,
        installments: 1,
        recurringTransactionId: null,
      }),
    ]);

    const summary = await service.summary(userId, { type: 'ALL' });

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.Mocked method reference, not called unbound
    expect(transactionsService.findAll).toHaveBeenCalledWith(userId);
    expect(summary.period).toEqual({ type: 'ALL', month: null, year: null });
    expect(summary.cashFlow.cashExpenses).toBe(80);
    expect(summary.expenses).toHaveLength(1);
    expect(summary.expenses[0].category.name).toBe('Groceries');
    expect(summary.expenses[0].total).toBe(80);
  });

  it('tells in the ledger whether the month of a recurring bill was paid', async () => {
    const rent = Object.assign(new Category(), {
      id: 'cat-rent',
      userId,
      name: 'Rent',
      kind: CategoryKind.FIXED_BILL,
      deletedAt: null,
    });
    categoriesService.findAllIncludingDeleted.mockResolvedValue([rent]);
    recurringTransactionsService.findAll.mockResolvedValue([
      Object.assign(new RecurringTransaction(), {
        id: 'rec-rent',
        userId,
        categoryId: rent.id,
        description: 'Rent',
        amount: 2000,
        dayOfMonth: 5,
        startMonth: YearMonth.parse('2026-01'),
        endMonth: null,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        cardId: null,
      }),
    ]);
    recurringTransactionsService.listOccurrencePayments.mockResolvedValue([
      Object.assign(new OccurrencePayment(), {
        userId,
        recurringTransactionId: 'rec-rent',
        month: YearMonth.parse('2026-09'),
      }),
    ]);

    const september = await service.ledger(userId, YearMonth.parse('2026-09'));
    const october = await service.ledger(userId, YearMonth.parse('2026-10'));

    expect(september.entries).toEqual([
      expect.objectContaining({ key: 'rec-rent|2026-09', paid: true }),
    ]);
    expect(october.entries).toEqual([
      expect.objectContaining({ key: 'rec-rent|2026-10', paid: false }),
    ]);
  });

  it('refuses the statement of a card the user does not have', async () => {
    await expect(
      service.cardStatement(userId, 'card-x', YearMonth.parse('2026-10')),
    ).rejects.toThrow(CardNotFoundException);
  });
});
