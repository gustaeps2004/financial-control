import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { toCents } from '../../../shared/domain/money';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import { StatementPayment } from '../../card-statements/domain/entities/statement-payment.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { CardStatement, CardStatementBook } from './card-statements';
import { CashFlow, computeCashFlow, shareOfIncome } from './cash-flow';
import { Cents, LedgerEntry, isCredit } from './ledger';
import {
  ReportPeriod,
  includesProjections,
  periodIncludes,
} from './report-period';

export interface CategoryLine {
  categoryId: string;
  total: Cents;
  share: number; // of the period's income
}

export interface SplitCategoryLine extends CategoryLine {
  cash: Cents; // paid straight from the account
  credit: Cents; // charged to a card
}

export interface CardLine {
  cardId: string;
  // Card bills paid during the period.
  paid: Cents;
  // What the period's statements carried in: adjustments plus later
  // installments of older purchases (spreadsheet: "Parcelamentos do mês").
  carried: Cents;
  // Purchases and recurring charges of the period's statements.
  newCharges: Cents;
  statementTotal: Cents;
  // What is still unpaid on the period's statements.
  outstanding: Cents;
}

export interface PaymentMethodLine {
  paymentMethod: PaymentMethod | null;
  total: Cents;
  share: number;
}

export interface AccountLine {
  cardId: string | null;
  total: Cents;
  debit: Cents;
  credit: Cents;
}

export interface PeriodSummary {
  period: ReportPeriod;
  // A month that has not arrived yet: recurring transactions and card
  // statements are projections.
  projected: boolean;
  cashFlow: CashFlow & { savingsRate: number; committedRate: number };
  income: CategoryLine[];
  savings: CategoryLine[];
  fixedBills: SplitCategoryLine[];
  expenses: SplitCategoryLine[];
  cards: CardLine[];
  // Day-to-day expenses only, like the spreadsheet.
  paymentMethods: PaymentMethodLine[];
  accounts: AccountLine[];
}

export interface PeriodSummaryInput {
  period: ReportPeriod;
  currentMonth: YearMonth;
  entries: readonly LedgerEntry[];
  statements: CardStatementBook;
  payments: readonly StatementPayment[];
}

const PAYMENT_METHODS: (PaymentMethod | null)[] = [
  PaymentMethod.DEBIT,
  PaymentMethod.CREDIT,
  PaymentMethod.PIX,
  PaymentMethod.CASH,
  PaymentMethod.BANK_TRANSFER,
  null,
];

function sum(values: Iterable<Cents>): Cents {
  let total = 0;
  for (const value of values) total += value;
  return total;
}

function byTotalDescending<T extends { total: Cents }>(a: T, b: T): number {
  return b.total - a.total;
}

export function buildPeriodSummary(input: PeriodSummaryInput): PeriodSummary {
  const { period, currentMonth } = input;
  const withProjections = includesProjections(period);
  const projected =
    period.type === 'MONTH' && period.month.isAfter(currentMonth);

  const entries = input.entries.filter(
    (entry) =>
      periodIncludes(period, entry.month) &&
      (withProjections || !entry.projected),
  );
  const statements = input.statements
    .all()
    .filter(
      (statement) =>
        periodIncludes(period, statement.month) &&
        (withProjections || !statement.month.isAfter(currentMonth)),
    );
  const payments = input.payments.filter((payment) =>
    periodIncludes(period, YearMonth.fromIsoDate(payment.paidOn)),
  );

  // A future month has no payments yet; what will leave the account then is
  // whatever its statements add up to.
  const cardBills = projected
    ? sum(statements.map((statement) => statement.total))
    : sum(payments.map((payment) => toCents(payment.amount)));
  const cashFlow = computeCashFlow(entries, cardBills);

  return {
    period,
    projected,
    cashFlow: {
      ...cashFlow,
      savingsRate: shareOfIncome(cashFlow.savings, cashFlow.income),
      committedRate: shareOfIncome(cashFlow.totalOut, cashFlow.income),
    },
    income: categoryLines(entries, CategoryKind.INCOME, cashFlow.income),
    savings: categoryLines(entries, CategoryKind.SAVINGS, cashFlow.income),
    fixedBills: categoryLines(
      entries,
      CategoryKind.FIXED_BILL,
      cashFlow.income,
    ),
    expenses: categoryLines(entries, CategoryKind.EXPENSE, cashFlow.income),
    cards: cardLines(input.statements.cardIds(), statements, payments),
    paymentMethods: paymentMethodLines(entries, cashFlow.income),
    accounts: accountLines(entries),
  };
}

function categoryLines(
  entries: readonly LedgerEntry[],
  kind: CategoryKind,
  income: Cents,
): SplitCategoryLine[] {
  const lines = new Map<string, SplitCategoryLine>();
  for (const entry of entries) {
    if (entry.kind !== kind) continue;

    const line = lines.get(entry.categoryId) ?? {
      categoryId: entry.categoryId,
      total: 0,
      share: 0,
      cash: 0,
      credit: 0,
    };
    line.total += entry.amount;
    if (isCredit(entry)) line.credit += entry.amount;
    else line.cash += entry.amount;
    lines.set(entry.categoryId, line);
  }

  return [...lines.values()]
    .map((line) => ({ ...line, share: shareOfIncome(line.total, income) }))
    .sort(byTotalDescending);
}

function cardLines(
  cardIds: string[],
  statements: readonly CardStatement[],
  payments: readonly StatementPayment[],
): CardLine[] {
  const ids = new Set([
    ...cardIds,
    ...payments.map((payment) => payment.cardId),
  ]);

  return [...ids].map((cardId) => {
    const cardStatements = statements.filter(
      (statement) => statement.cardId === cardId,
    );
    return {
      cardId,
      paid: sum(
        payments
          .filter((payment) => payment.cardId === cardId)
          .map((payment) => toCents(payment.amount)),
      ),
      carried: sum(
        cardStatements.map(
          (statement) => statement.adjustment + statement.installments,
        ),
      ),
      newCharges: sum(
        cardStatements.map(
          (statement) => statement.purchases + statement.recurring,
        ),
      ),
      statementTotal: sum(cardStatements.map((statement) => statement.total)),
      outstanding: sum(
        cardStatements.map((statement) =>
          Math.max(0, statement.total - statement.paid),
        ),
      ),
    };
  });
}

function paymentMethodLines(
  entries: readonly LedgerEntry[],
  income: Cents,
): PaymentMethodLine[] {
  const expenses = entries.filter(
    (entry) => entry.kind === CategoryKind.EXPENSE,
  );
  return PAYMENT_METHODS.map((paymentMethod) => {
    const total = sum(
      expenses
        .filter((entry) => entry.paymentMethod === paymentMethod)
        .map((entry) => entry.amount),
    );
    return { paymentMethod, total, share: shareOfIncome(total, income) };
  });
}

function accountLines(entries: readonly LedgerEntry[]): AccountLine[] {
  const lines = new Map<string | null, AccountLine>();
  for (const entry of entries) {
    if (entry.kind !== CategoryKind.EXPENSE) continue;

    const line = lines.get(entry.cardId) ?? {
      cardId: entry.cardId,
      total: 0,
      debit: 0,
      credit: 0,
    };
    line.total += entry.amount;
    if (entry.paymentMethod === PaymentMethod.DEBIT) line.debit += entry.amount;
    if (entry.paymentMethod === PaymentMethod.CREDIT)
      line.credit += entry.amount;
    lines.set(entry.cardId, line);
  }
  return [...lines.values()].sort(byTotalDescending);
}
