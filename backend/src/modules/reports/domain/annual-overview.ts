import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { toCents } from '../../../shared/domain/money';
import { StatementPayment } from '../../card-statements/domain/entities/statement-payment.entity';
import { CardStatementBook } from './card-statements';
import { CashFlow, computeCashFlow } from './cash-flow';
import { LedgerEntry } from './ledger';

export type MonthStatus = 'REALIZED' | 'PROJECTED';

export interface AnnualMonth {
  month: YearMonth;
  status: MonthStatus;
  cashFlow: CashFlow;
}

export interface AnnualOverview {
  year: number;
  months: AnnualMonth[];
  // Months that already happened.
  realized: CashFlow;
  // The whole year, projections included.
  withProjection: CashFlow;
}

export interface AnnualOverviewInput {
  year: number;
  currentMonth: YearMonth;
  entries: readonly LedgerEntry[];
  statements: CardStatementBook;
  payments: readonly StatementPayment[];
}

const EMPTY_CASH_FLOW: CashFlow = {
  income: 0,
  fixedBills: 0,
  cardBills: 0,
  cashExpenses: 0,
  totalOut: 0,
  savings: 0,
  leftover: 0,
  creditPurchases: 0,
};

function addCashFlows(a: CashFlow, b: CashFlow): CashFlow {
  return {
    income: a.income + b.income,
    fixedBills: a.fixedBills + b.fixedBills,
    cardBills: a.cardBills + b.cardBills,
    cashExpenses: a.cashExpenses + b.cashExpenses,
    totalOut: a.totalOut + b.totalOut,
    savings: a.savings + b.savings,
    leftover: a.leftover + b.leftover,
    creditPurchases: a.creditPurchases + b.creditPurchases,
  };
}

/**
 * Month by month for a year (the spreadsheet's "Visão Anual"). Months after
 * the current one are projections: recurring transactions posted
 * automatically and card statements expected to be paid.
 */
export function buildAnnualOverview(
  input: AnnualOverviewInput,
): AnnualOverview {
  const months = YearMonth.range(
    YearMonth.of(input.year, 1),
    YearMonth.of(input.year, 12),
  ).map((month): AnnualMonth => {
    const projected = month.isAfter(input.currentMonth);
    const entries = input.entries.filter((entry) => entry.month.equals(month));
    const cardBills = projected
      ? input.statements
          .forMonth(month)
          .reduce((sum, statement) => sum + statement.total, 0)
      : input.payments
          .filter((payment) =>
            YearMonth.fromIsoDate(payment.paidOn).equals(month),
          )
          .reduce((sum, payment) => sum + toCents(payment.amount), 0);

    return {
      month,
      status: projected ? 'PROJECTED' : 'REALIZED',
      cashFlow: computeCashFlow(entries, cardBills),
    };
  });

  return {
    year: input.year,
    months,
    realized: months
      .filter((month) => month.status === 'REALIZED')
      .reduce((total, month) => addCashFlows(total, month.cashFlow), {
        ...EMPTY_CASH_FLOW,
      }),
    withProjection: months.reduce(
      (total, month) => addCashFlows(total, month.cashFlow),
      { ...EMPTY_CASH_FLOW },
    ),
  };
}
