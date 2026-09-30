import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { toCents } from '../../../shared/domain/money';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import { Card } from '../../cards/domain/entities/card.entity';
import { StatementAdjustment } from '../../card-statements/domain/entities/statement-adjustment.entity';
import { StatementPayment } from '../../card-statements/domain/entities/statement-payment.entity';
import { Category } from '../../categories/domain/entities/category.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { RecurringTransaction } from '../../recurring-transactions/domain/entities/recurring-transaction.entity';
import { Transaction } from '../../transactions/domain/entities/transaction.entity';
import { buildAnnualOverview } from './annual-overview';
import { buildCardStatements } from './card-statements';
import { buildLedger } from './ledger';
import { buildPeriodSummary } from './period-summary';

/*
 * The owner's own spreadsheet ("Controle_Financeiro.xlsx"), rebuilt with the
 * app's model. Every expected value below is the one the spreadsheet itself
 * computed (its "Visão Anual" and "Resumo" tabs), so this test pins the app
 * to the same numbers.
 */

const { INCOME, EXPENSE, FIXED_BILL, SAVINGS } = CategoryKind;
const { CREDIT, PIX } = PaymentMethod;

const categoryList = (
  [
    ['Salário', INCOME],
    ['Outras Entradas', INCOME],
    ['Dinheiro Guardado', SAVINGS],
    ['Internet', FIXED_BILL],
    ['Financiamento Moto', FIXED_BILL],
    ['Consórcio', FIXED_BILL],
    ['Faculdade - Mensalidade', FIXED_BILL],
    ['Supermercado', EXPENSE],
    ['Combustível', EXPENSE],
    ['Faculdade - Outros Gastos', EXPENSE],
    ['Comida na Faculdade', EXPENSE],
    ['Lazer - Cinema', EXPENSE],
    ['Lazer - Restaurante', EXPENSE],
    ['Lazer - Outros', EXPENSE],
    ['Dinheiro para os Pais', EXPENSE],
  ] as const
).map(([name, kind]) =>
  Object.assign(new Category(), { id: name, name, kind, deletedAt: null }),
);
const categories = new Map(categoryList.map((c) => [c.id, c]));

// One closing day for every card, paid the day after (spreadsheet tab
// "Cartões": "Dia de fechamento das faturas: 9").
const cards = ['Itaú', 'Nubank', 'Inter'].map((name) =>
  Object.assign(new Card(), {
    id: name,
    nickname: name,
    closingDay: 9,
    dueDay: 10,
    deletedAt: null,
  }),
);

let sequence = 0;
function txn(
  date: string,
  category: string,
  amount: number,
  paymentMethod: PaymentMethod | null = null,
  cardId: string | null = null,
  description: string | null = null,
): Transaction {
  sequence += 1;
  return Object.assign(new Transaction(), {
    id: `txn-${sequence}`,
    categoryId: category,
    date,
    description,
    amount,
    paymentMethod,
    cardId,
    installments: 1,
    recurringTransactionId: null,
  });
}

// Tab "Lançamentos", minus the three card bill payments (below).
const transactions = [
  txn('2026-09-06', 'Salário', 2492, null, null, 'Pró labore'),
  txn('2026-09-04', 'Outras Entradas', 286, null, null, 'Venda Celular'),
  txn('2026-09-06', 'Outras Entradas', 871, null, null, 'Gastos no cartão'),
  txn('2026-09-08', 'Dinheiro para os Pais', 300, PIX, 'Itaú'),
  txn('2026-09-09', 'Salário', 6298, null, null, 'Lucro'),
  txn('2026-09-09', 'Lazer - Outros', 55, PIX, 'Inter', 'Controle portão'),
  txn('2026-09-09', 'Lazer - Outros', 80, PIX, 'Inter', 'Volei'),
  txn('2026-09-09', 'Combustível', 50, CREDIT, 'Itaú'),
  txn('2026-08-01', 'Dinheiro Guardado', 11088),
  txn('2026-09-09', 'Dinheiro Guardado', 2111.26),
  txn('2026-09-11', 'Lazer - Outros', 14.99, CREDIT, 'Itaú'),
  txn('2026-09-11', 'Lazer - Outros', 45.81, CREDIT, 'Itaú'),
  txn('2026-09-11', 'Lazer - Restaurante', 155.5, CREDIT, 'Itaú'),
  txn('2026-09-11', 'Lazer - Outros', 121.45, CREDIT, 'Itaú'),
  txn('2026-09-13', 'Lazer - Restaurante', 158.4, CREDIT, 'Itaú'),
  txn('2026-09-13', 'Lazer - Outros', 22, CREDIT, 'Itaú'),
  txn('2026-09-13', 'Combustível', 59.98, CREDIT, 'Itaú'),
  txn('2026-09-13', 'Lazer - Outros', 182, CREDIT, 'Itaú'),
  txn('2026-09-14', 'Comida na Faculdade', 11.5, CREDIT, 'Itaú'),
  txn('2026-09-15', 'Dinheiro Guardado', -300),
  txn('2026-09-16', 'Dinheiro Guardado', -2850),
  txn('2026-09-16', 'Lazer - Outros', 35.99, CREDIT, 'Itaú'),
  txn('2026-09-16', 'Comida na Faculdade', 12, CREDIT, 'Itaú'),
  txn('2026-09-17', 'Lazer - Restaurante', 26, CREDIT, 'Itaú'),
  txn('2026-09-18', 'Lazer - Restaurante', 47.5, CREDIT, 'Itaú'),
  txn('2026-09-18', 'Combustível', 16.31, CREDIT, 'Itaú'),
  txn('2026-09-18', 'Lazer - Outros', 150, CREDIT, 'Itaú'),
  txn('2026-09-19', 'Dinheiro Guardado', -38.5),
  txn('2026-09-20', 'Lazer - Restaurante', 101.99, CREDIT, 'Itaú'),
  txn('2026-09-21', 'Comida na Faculdade', 27.5, CREDIT, 'Itaú'),
];

// Tab "Contas Fixas".
const recurringTransactions = (
  [
    ['Internet', 149.91],
    ['Financiamento Moto', 623],
    ['Consórcio', 979.67],
    ['Faculdade - Mensalidade', 814.73],
  ] as const
).map(([name, amount]) =>
  Object.assign(new RecurringTransaction(), {
    id: `rec-${name}`,
    categoryId: name,
    description: name,
    amount,
    dayOfMonth: 6,
    startMonth: YearMonth.parse('2026-09'),
    endMonth: null,
    paymentMethod: null,
    cardId: null,
  }),
);

// Tab "Cartões", column "Parcelamentos / valor inicial".
const adjustments = (
  [
    ['Itaú', '2026-10', 1663.08],
    ['Itaú', '2026-11', 1388.08],
    ['Itaú', '2026-12', 725.41],
    ['Nubank', '2026-10', 334.45],
    ['Inter', '2026-10', 371.21],
    ['Inter', '2026-11', 371.21],
  ] as const
).map(([cardId, month, amount]) =>
  Object.assign(new StatementAdjustment(), {
    cardId,
    statementMonth: YearMonth.parse(month),
    amount,
  }),
);

// The "Cartão de Crédito ..." rows of "Lançamentos": September bills.
const payments = (
  [
    ['Nubank', 334.45],
    ['Inter', 371.21],
    ['Itaú', 4454.89],
  ] as const
).map(([cardId, amount]) =>
  Object.assign(new StatementPayment(), {
    id: `pay-${cardId}`,
    cardId,
    statementMonth: YearMonth.parse('2026-09'),
    paidOn: '2026-09-10',
    amount,
  }),
);

const today = '2026-09-30';
const currentMonth = YearMonth.fromIsoDate(today);
const months = YearMonth.range(
  YearMonth.parse('2026-01'),
  YearMonth.parse('2026-12'),
);

const entries = buildLedger({
  transactions,
  recurringTransactions,
  categories,
  recurringMonths: { from: months[0], to: months[11] },
  currentMonth,
});
const statements = buildCardStatements({
  cards,
  entries,
  adjustments,
  payments,
  months,
  today,
});

const reais = (amount: number) => toCents(amount);

describe('the owner spreadsheet, rebuilt in the app', () => {
  describe('annual overview ("Visão Anual" 2026)', () => {
    const annual = buildAnnualOverview({
      year: 2026,
      currentMonth,
      entries,
      statements,
      payments,
    });
    const month = (value: string) =>
      annual.months.find((m) => m.month.toString() === value)!;

    it('matches August', () => {
      expect(month('2026-08').cashFlow).toMatchObject({
        income: 0,
        savings: reais(11088),
        totalOut: 0,
      });
      expect(month('2026-08').status).toBe('REALIZED');
    });

    it('matches September', () => {
      expect(month('2026-09').cashFlow).toMatchObject({
        income: reais(9947),
        fixedBills: reais(2567.31),
        cardBills: reais(5160.55),
        cashExpenses: reais(435),
        creditPurchases: reais(1238.92),
        savings: reais(-1077.24),
        totalOut: reais(8162.86),
      });
    });

    it.each([
      ['2026-10', 3557.66, 6124.97],
      ['2026-11', 1759.29, 4326.6],
      ['2026-12', 725.41, 3292.72],
    ])('projects %s', (value, cardBills, totalOut) => {
      expect(month(value).status).toBe('PROJECTED');
      expect(month(value).cashFlow).toMatchObject({
        fixedBills: reais(2567.31),
        cardBills: reais(cardBills),
        totalOut: reais(totalOut),
      });
    });

    it('matches the realized total', () => {
      expect(annual.realized).toMatchObject({
        income: reais(9947),
        fixedBills: reais(2567.31),
        cardBills: reais(5160.55),
        cashExpenses: reais(435),
        creditPurchases: reais(1238.92),
        savings: reais(10010.76),
        totalOut: reais(8162.86),
      });
    });

    it('matches the total with projections', () => {
      expect(annual.withProjection).toMatchObject({
        income: reais(9947),
        fixedBills: reais(10269.24),
        cardBills: reais(11202.91),
        cashExpenses: reais(435),
        savings: reais(10010.76),
        totalOut: reais(21907.15),
      });
    });
  });

  describe('summary of October 2026 ("Resumo", a projected month)', () => {
    const summary = buildPeriodSummary({
      period: { type: 'MONTH', month: YearMonth.parse('2026-10') },
      currentMonth,
      entries,
      statements,
      payments,
    });

    it('is a projection', () => {
      expect(summary.projected).toBe(true);
    });

    it('matches the panorama', () => {
      expect(summary.cashFlow).toMatchObject({
        income: 0,
        fixedBills: reais(2567.31),
        cardBills: reais(3557.66),
        cashExpenses: 0,
        totalOut: reais(6124.97),
        savings: 0,
        leftover: reais(-6124.97),
        creditPurchases: 0,
        savingsRate: 0,
        committedRate: 0,
      });
    });

    it('matches the fixed bills', () => {
      expect(
        summary.fixedBills.map((line) => [line.categoryId, line.total]),
      ).toEqual([
        ['Consórcio', reais(979.67)],
        ['Faculdade - Mensalidade', reais(814.73)],
        ['Financiamento Moto', reais(623)],
        ['Internet', reais(149.91)],
      ]);
    });

    it('matches the credit cards table', () => {
      expect(summary.cards).toEqual([
        {
          cardId: 'Itaú',
          paid: 0,
          carried: reais(1663.08),
          newCharges: reais(1188.92),
          statementTotal: reais(2852),
          outstanding: reais(2852),
        },
        {
          cardId: 'Nubank',
          paid: 0,
          carried: reais(334.45),
          newCharges: 0,
          statementTotal: reais(334.45),
          outstanding: reais(334.45),
        },
        {
          cardId: 'Inter',
          paid: 0,
          carried: reais(371.21),
          newCharges: 0,
          statementTotal: reais(371.21),
          outstanding: reais(371.21),
        },
      ]);
    });
  });

  describe('summary of September 2026 (the month that happened)', () => {
    const summary = buildPeriodSummary({
      period: { type: 'MONTH', month: YearMonth.parse('2026-09') },
      currentMonth,
      entries,
      statements,
      payments,
    });

    it('matches the panorama', () => {
      expect(summary.projected).toBe(false);
      expect(summary.cashFlow).toMatchObject({
        income: reais(9947),
        fixedBills: reais(2567.31),
        cardBills: reais(5160.55),
        cashExpenses: reais(435),
        totalOut: reais(8162.86),
        savings: reais(-1077.24),
        leftover: reais(2861.38),
        creditPurchases: reais(1238.92),
      });
      expect(summary.cashFlow.committedRate).toBeCloseTo(8162.86 / 9947, 10);
    });

    it('splits day-to-day spending into paid now and charged to a card', () => {
      expect(
        summary.expenses.map((line) => [
          line.categoryId,
          line.total,
          line.cash,
          line.credit,
        ]),
      ).toEqual([
        ['Lazer - Outros', reais(707.24), reais(135), reais(572.24)],
        ['Lazer - Restaurante', reais(489.39), 0, reais(489.39)],
        ['Dinheiro para os Pais', reais(300), reais(300), 0],
        ['Combustível', reais(126.29), 0, reais(126.29)],
        ['Comida na Faculdade', reais(51), 0, reais(51)],
      ]);
    });

    it('breaks spending down by payment method', () => {
      expect(
        summary.paymentMethods.map((line) => [line.paymentMethod, line.total]),
      ).toEqual([
        [PaymentMethod.DEBIT, 0],
        [PaymentMethod.CREDIT, reais(1238.92)],
        [PaymentMethod.PIX, reais(435)],
        [PaymentMethod.CASH, 0],
        [PaymentMethod.BANK_TRANSFER, 0],
        [null, 0],
      ]);
    });

    it('breaks spending down by account', () => {
      expect(summary.accounts).toEqual([
        {
          cardId: 'Itaú',
          total: reais(1538.92),
          debit: 0,
          credit: reais(1238.92),
        },
        { cardId: 'Inter', total: reais(135), debit: 0, credit: 0 },
      ]);
    });

    it('counts the bills paid in the month', () => {
      expect(
        summary.cards.map((line) => [
          line.cardId,
          line.paid,
          line.statementTotal,
        ]),
      ).toEqual([
        ['Itaú', reais(4454.89), reais(50)],
        ['Nubank', reais(334.45), 0],
        ['Inter', reais(371.21), 0],
      ]);
    });
  });

  describe('summary of the whole year (only what already happened)', () => {
    const summary = buildPeriodSummary({
      period: { type: 'YEAR', year: 2026 },
      currentMonth,
      entries,
      statements,
      payments,
    });

    it('leaves the projected months out', () => {
      expect(summary.projected).toBe(false);
      expect(summary.cashFlow).toMatchObject({
        income: reais(9947),
        fixedBills: reais(2567.31),
        cardBills: reais(5160.55),
        savings: reais(10010.76),
      });
    });
  });
});
