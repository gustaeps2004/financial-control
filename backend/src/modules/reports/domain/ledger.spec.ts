import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import { Category } from '../../categories/domain/entities/category.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { OccurrencePayment } from '../../recurring-transactions/domain/entities/occurrence-payment.entity';
import { RecurringTransaction } from '../../recurring-transactions/domain/entities/recurring-transaction.entity';
import { Transaction } from '../../transactions/domain/entities/transaction.entity';
import { LedgerEntry, buildLedger } from './ledger';

const internet = Object.assign(new Category(), {
  id: 'cat-internet',
  name: 'Internet',
  kind: CategoryKind.FIXED_BILL,
});
const restaurants = Object.assign(new Category(), {
  id: 'cat-restaurants',
  name: 'Restaurants',
  kind: CategoryKind.EXPENSE,
});
const categories = new Map([
  [internet.id, internet],
  [restaurants.id, restaurants],
]);

const internetBill = Object.assign(new RecurringTransaction(), {
  id: 'rec-internet',
  categoryId: internet.id,
  description: 'Internet',
  amount: 149.91,
  dayOfMonth: 6,
  startMonth: YearMonth.parse('2026-09'),
  endMonth: null,
  paymentMethod: null,
  cardId: null,
});

function transaction(overrides: Partial<Transaction>): Transaction {
  return Object.assign(new Transaction(), {
    id: 'txn-1',
    categoryId: restaurants.id,
    date: '2026-09-13',
    description: 'Madero',
    amount: 158.4,
    paymentMethod: PaymentMethod.CREDIT,
    cardId: 'card-itau',
    installments: 1,
    recurringTransactionId: null,
    ...overrides,
  });
}

describe('buildLedger', () => {
  const recurringMonths = {
    from: YearMonth.parse('2026-08'),
    to: YearMonth.parse('2026-11'),
  };
  const currentMonth = YearMonth.parse('2026-09');

  it('turns transactions into entries in cents with the category kind', () => {
    const [entry] = buildLedger({
      transactions: [transaction({})],
      recurringTransactions: [],
      occurrencePayments: [],
      categories,
      recurringMonths,
      currentMonth,
    });

    expect(entry).toMatchObject({
      source: 'TRANSACTION',
      transactionId: 'txn-1',
      amount: 15840,
      kind: CategoryKind.EXPENSE,
      projected: false,
    });
    expect(entry.month.toString()).toBe('2026-09');
  });

  it('posts a recurring transaction in every month it is active', () => {
    const entries = buildLedger({
      transactions: [],
      recurringTransactions: [internetBill],
      occurrencePayments: [],
      categories,
      recurringMonths,
      currentMonth,
    });

    expect(entries.map((entry) => entry.date)).toEqual([
      '2026-11-06',
      '2026-10-06',
      '2026-09-06',
    ]);
    expect(entries.every((entry) => entry.amount === 14991)).toBe(true);
    expect(
      entries.every((entry) => entry.kind === CategoryKind.FIXED_BILL),
    ).toBe(true);
  });

  it('marks occurrences in months after the current one as projected', () => {
    const entries = buildLedger({
      transactions: [],
      recurringTransactions: [internetBill],
      occurrencePayments: [],
      categories,
      recurringMonths,
      currentMonth,
    });

    const projectedMonths = entries
      .filter((entry) => entry.projected)
      .map((entry) => entry.month.toString());
    expect(projectedMonths).toEqual(['2026-11', '2026-10']);
  });

  it('lets a transaction logged by hand replace the occurrence of its month', () => {
    const entries = buildLedger({
      transactions: [
        transaction({
          id: 'txn-internet-oct',
          categoryId: internet.id,
          date: '2026-10-08',
          amount: 159.9,
          paymentMethod: PaymentMethod.PIX,
          cardId: null,
          recurringTransactionId: internetBill.id,
        }),
      ],
      recurringTransactions: [internetBill],
      occurrencePayments: [],
      categories,
      recurringMonths,
      currentMonth,
    });

    const october = entries.filter(
      (entry) => entry.month.toString() === '2026-10',
    );
    expect(october).toHaveLength(1);
    expect(october[0]).toMatchObject({ source: 'TRANSACTION', amount: 15990 });
  });

  it('stops posting after the end month', () => {
    const entries = buildLedger({
      transactions: [],
      recurringTransactions: [
        Object.assign(new RecurringTransaction(), {
          ...internetBill,
          endMonth: YearMonth.parse('2026-09'),
        }),
      ],
      occurrencePayments: [],
      categories,
      recurringMonths,
      currentMonth,
    });

    expect(entries.map((entry) => entry.month.toString())).toEqual(['2026-09']);
  });

  describe('paid marks', () => {
    const salary = Object.assign(new Category(), {
      id: 'cat-salary',
      name: 'Salary',
      kind: CategoryKind.INCOME,
    });
    const internetPaidInOctober = Object.assign(new OccurrencePayment(), {
      recurringTransactionId: internetBill.id,
      month: YearMonth.parse('2026-10'),
    });

    function paidBy(
      label: (entry: LedgerEntry) => string,
      entries: LedgerEntry[],
    ): Record<string, boolean | null> {
      return Object.fromEntries(
        entries.map((entry) => [label(entry), entry.paid]),
      );
    }

    it('tells which months of a recurring bill were marked paid', () => {
      const entries = buildLedger({
        transactions: [],
        recurringTransactions: [internetBill],
        occurrencePayments: [internetPaidInOctober],
        categories,
        recurringMonths,
        currentMonth,
      });

      expect(paidBy((entry) => entry.month.toString(), entries)).toEqual({
        '2026-09': false,
        '2026-10': true,
        '2026-11': false,
      });
    });

    it('keeps the mark when the value of that month was logged by hand', () => {
      const entries = buildLedger({
        transactions: [
          transaction({
            id: 'txn-internet-oct',
            categoryId: internet.id,
            date: '2026-10-08',
            amount: 159.9,
            paymentMethod: PaymentMethod.PIX,
            cardId: null,
            recurringTransactionId: internetBill.id,
          }),
        ],
        recurringTransactions: [internetBill],
        occurrencePayments: [internetPaidInOctober],
        categories,
        recurringMonths,
        currentMonth,
      });

      const october = entries.filter(
        (entry) => entry.month.toString() === '2026-10',
      );
      expect(october).toEqual([
        expect.objectContaining({ source: 'TRANSACTION', paid: true }),
      ]);
    });

    it('leaves out income, card charges and what no recurring bill backs', () => {
      const entries = buildLedger({
        transactions: [
          // Not linked to anything.
          transaction({ paymentMethod: PaymentMethod.PIX, cardId: null }),
          // This month's internet, charged to a card instead.
          transaction({
            id: 'txn-internet-sep',
            categoryId: internet.id,
            description: 'Internet',
            recurringTransactionId: internetBill.id,
          }),
          // Its recurring transaction was deleted since.
          transaction({
            id: 'txn-gym-sep',
            categoryId: internet.id,
            description: 'Gym',
            paymentMethod: PaymentMethod.PIX,
            cardId: null,
            recurringTransactionId: 'rec-deleted',
          }),
        ],
        recurringTransactions: [
          internetBill,
          Object.assign(new RecurringTransaction(), {
            ...internetBill,
            id: 'rec-salary',
            categoryId: salary.id,
            description: 'Salary',
          }),
          Object.assign(new RecurringTransaction(), {
            ...internetBill,
            id: 'rec-streaming',
            description: 'Streaming',
            paymentMethod: PaymentMethod.CREDIT,
            cardId: 'card-itau',
          }),
        ],
        occurrencePayments: [],
        categories: new Map([...categories, [salary.id, salary]]),
        recurringMonths: { from: currentMonth, to: currentMonth },
        currentMonth,
      });

      expect(paidBy((entry) => entry.description!, entries)).toEqual({
        Madero: null,
        Internet: null,
        Gym: null,
        Salary: null,
        Streaming: null,
      });
    });
  });
});
