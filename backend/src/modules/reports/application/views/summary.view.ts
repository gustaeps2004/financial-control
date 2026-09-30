import { PaymentMethod } from '../../../../shared/domain/payment/payment-method.enum';
import {
  CategoryLine,
  PeriodSummary,
  SplitCategoryLine,
} from '../../domain/period-summary';
import {
  CardRef,
  CashFlowView,
  CategoryRef,
  ReferenceIndex,
  cashFlowView,
  money,
} from './refs.view';

export interface CategoryLineView {
  category: CategoryRef;
  total: number;
  share: number;
}

export interface SplitCategoryLineView extends CategoryLineView {
  cash: number;
  credit: number;
}

export interface SummaryView {
  period: {
    type: 'MONTH' | 'YEAR' | 'ALL';
    month: string | null;
    year: number | null;
  };
  currentMonth: string;
  projected: boolean;
  cashFlow: CashFlowView & { savingsRate: number; committedRate: number };
  income: CategoryLineView[];
  savings: CategoryLineView[];
  fixedBills: SplitCategoryLineView[];
  expenses: SplitCategoryLineView[];
  cards: {
    card: CardRef;
    paid: number;
    carried: number;
    newCharges: number;
    statementTotal: number;
    outstanding: number;
  }[];
  paymentMethods: {
    paymentMethod: PaymentMethod | null;
    total: number;
    share: number;
  }[];
  accounts: {
    card: CardRef | null;
    total: number;
    debit: number;
    credit: number;
  }[];
}

export function summaryView(
  summary: PeriodSummary,
  refs: ReferenceIndex,
  currentMonth: string,
): SummaryView {
  const { period } = summary;

  const categoryLine = (line: CategoryLine): CategoryLineView[] => {
    const category = refs.categoryRef(line.categoryId);
    return category
      ? [{ category, total: money(line.total), share: line.share }]
      : [];
  };
  const splitCategoryLine = (
    line: SplitCategoryLine,
  ): SplitCategoryLineView[] =>
    categoryLine(line).map((view) => ({
      ...view,
      cash: money(line.cash),
      credit: money(line.credit),
    }));

  return {
    period: {
      type: period.type,
      month: period.type === 'MONTH' ? period.month.toString() : null,
      year: period.type === 'YEAR' ? period.year : null,
    },
    currentMonth,
    projected: summary.projected,
    cashFlow: {
      ...cashFlowView(summary.cashFlow),
      savingsRate: summary.cashFlow.savingsRate,
      committedRate: summary.cashFlow.committedRate,
    },
    income: summary.income.flatMap(categoryLine),
    savings: summary.savings.flatMap(categoryLine),
    fixedBills: summary.fixedBills.flatMap(splitCategoryLine),
    expenses: summary.expenses.flatMap(splitCategoryLine),
    cards: summary.cards.flatMap((line) => {
      const card = refs.cardRef(line.cardId);
      return card
        ? [
            {
              card,
              paid: money(line.paid),
              carried: money(line.carried),
              newCharges: money(line.newCharges),
              statementTotal: money(line.statementTotal),
              outstanding: money(line.outstanding),
            },
          ]
        : [];
    }),
    paymentMethods: summary.paymentMethods.map((line) => ({
      paymentMethod: line.paymentMethod,
      total: money(line.total),
      share: line.share,
    })),
    accounts: summary.accounts.map((line) => ({
      card: refs.cardRef(line.cardId),
      total: money(line.total),
      debit: money(line.debit),
      credit: money(line.credit),
    })),
  };
}
