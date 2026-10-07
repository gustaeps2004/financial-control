import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import { Card } from '../../cards/domain/entities/card.entity';
import { StatementAdjustment } from '../../card-statements/domain/entities/statement-adjustment.entity';
import { StatementPayment } from '../../card-statements/domain/entities/statement-payment.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { buildCardStatements, splitInstallments } from './card-statements';
import { LedgerEntry } from './ledger';

const itau = Object.assign(new Card(), {
  id: 'card-itau',
  nickname: 'Itaú',
  closingDay: 9,
  dueDay: 10,
});

function creditEntry(overrides: Partial<LedgerEntry>): LedgerEntry {
  return {
    key: 'txn-1',
    source: 'TRANSACTION',
    transactionId: 'txn-1',
    recurringTransactionId: null,
    date: '2026-09-13',
    month: YearMonth.parse('2026-09'),
    description: 'Madero',
    amount: 15840,
    categoryId: 'cat-restaurants',
    kind: CategoryKind.EXPENSE,
    paymentMethod: PaymentMethod.CREDIT,
    cardId: itau.id,
    installments: 1,
    projected: false,
    paid: null,
    ...overrides,
  };
}

const months = YearMonth.range(
  YearMonth.parse('2026-09'),
  YearMonth.parse('2026-12'),
);

describe('splitInstallments', () => {
  it('puts the rounding difference on the first installment', () => {
    expect(splitInstallments(10000, 3)).toEqual([3334, 3333, 3333]);
    expect(splitInstallments(10001, 3)).toEqual([3335, 3333, 3333]);
    expect(splitInstallments(15840, 1)).toEqual([15840]);
  });

  it('always adds back up to the total', () => {
    const parts = splitInstallments(123457, 7);
    expect(parts.reduce((sum, part) => sum + part, 0)).toBe(123457);
  });
});

describe('buildCardStatements', () => {
  it('puts purchases on the statement the closing day assigns them to', () => {
    const book = buildCardStatements({
      cards: [itau],
      entries: [
        creditEntry({
          key: 'on-closing-day',
          date: '2026-09-09',
          amount: 5000,
        }),
        creditEntry({ key: 'after-closing', date: '2026-09-10', amount: 1000 }),
      ],
      adjustments: [],
      payments: [],
      months,
      today: '2026-09-30',
    });

    expect(book.get(itau.id, YearMonth.parse('2026-09'))?.purchases).toBe(5000);
    expect(book.get(itau.id, YearMonth.parse('2026-10'))?.purchases).toBe(1000);
  });

  it('spreads installments over the following statements', () => {
    const book = buildCardStatements({
      cards: [itau],
      entries: [creditEntry({ amount: 30000, installments: 3 })],
      adjustments: [],
      payments: [],
      months,
      today: '2026-09-30',
    });

    const october = book.get(itau.id, YearMonth.parse('2026-10'))!;
    const november = book.get(itau.id, YearMonth.parse('2026-11'))!;
    const december = book.get(itau.id, YearMonth.parse('2026-12'))!;
    expect(october).toMatchObject({ purchases: 10000, installments: 0 });
    expect(november).toMatchObject({ purchases: 0, installments: 10000 });
    expect(december.charges[0]).toMatchObject({
      installment: 3,
      installments: 3,
      amount: 10000,
    });
  });

  it('keeps recurring charges apart from purchases', () => {
    const book = buildCardStatements({
      cards: [itau],
      entries: [
        creditEntry({
          key: 'rec-claude|2026-09',
          source: 'RECURRING',
          transactionId: null,
          recurringTransactionId: 'rec-claude',
          date: '2026-09-11',
          amount: 12145,
        }),
      ],
      adjustments: [],
      payments: [],
      months,
      today: '2026-09-30',
    });

    expect(book.get(itau.id, YearMonth.parse('2026-10'))).toMatchObject({
      recurring: 12145,
      purchases: 0,
      total: 12145,
    });
  });

  it('adds the adjustment and the payments of each statement', () => {
    const october = YearMonth.parse('2026-10');
    const book = buildCardStatements({
      cards: [itau],
      entries: [creditEntry({ amount: 118892 })],
      adjustments: [
        Object.assign(new StatementAdjustment(), {
          cardId: itau.id,
          statementMonth: october,
          amount: 1663.08,
        }),
      ],
      payments: [
        Object.assign(new StatementPayment(), {
          id: 'pay-1',
          cardId: itau.id,
          statementMonth: october,
          paidOn: '2026-10-10',
          amount: 2852,
        }),
      ],
      months,
      today: '2026-10-10',
    });

    expect(book.get(itau.id, october)).toMatchObject({
      adjustment: 166308,
      purchases: 118892,
      total: 285200,
      paid: 285200,
      status: 'PAID',
      closingDate: '2026-10-09',
      dueDate: '2026-10-10',
    });
  });

  describe('status', () => {
    function statusOn(today: string, monthValue = '2026-10') {
      const book = buildCardStatements({
        cards: [itau],
        entries: [creditEntry({ date: '2026-09-20' })],
        adjustments: [],
        payments: [],
        months,
        today,
      });
      return book.get(itau.id, YearMonth.parse(monthValue))?.status;
    }

    it('is open while its cycle is running, closing day included', () => {
      expect(statusOn('2026-09-10')).toBe('OPEN');
      expect(statusOn('2026-10-09')).toBe('OPEN');
    });

    it('is closed after the closing day and overdue after the due day', () => {
      expect(statusOn('2026-10-10')).toBe('CLOSED');
      expect(statusOn('2026-10-11')).toBe('OVERDUE');
    });

    it('is upcoming before its cycle starts', () => {
      expect(statusOn('2026-09-09')).toBe('UPCOMING');
    });

    it('is empty when nothing lands on it', () => {
      expect(statusOn('2026-09-30', '2026-12')).toBe('EMPTY');
    });
  });

  it('only shows removed cards that still have something on them', () => {
    const removedIdle = Object.assign(new Card(), {
      ...itau,
      id: 'card-idle',
      deletedAt: new Date('2026-01-01'),
    });
    const removedBusy = Object.assign(new Card(), {
      ...itau,
      id: 'card-busy',
      deletedAt: new Date('2026-01-01'),
    });

    const book = buildCardStatements({
      cards: [itau, removedIdle, removedBusy],
      entries: [creditEntry({ cardId: 'card-busy' })],
      adjustments: [],
      payments: [],
      months,
      today: '2026-09-30',
    });

    expect(book.cardIds().sort()).toEqual(['card-busy', 'card-itau']);
  });
});
