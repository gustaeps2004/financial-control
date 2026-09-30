import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { Card } from '../../../cards/domain/entities/card.entity';
import {
  CardStatement,
  CardStatementBook,
  StatementStatus,
} from '../../domain/card-statements';
import { LedgerSource } from '../../domain/ledger';
import {
  CardRef,
  CategoryRef,
  ReferenceIndex,
  cardRef,
  money,
} from './refs.view';

export interface StatementCardView extends CardRef {
  closingDay: number;
  dueDay: number | null;
  creditLimit: number;
}

export interface StatementView {
  month: string;
  closingDate: string;
  dueDate: string | null;
  adjustment: number;
  installments: number;
  purchases: number;
  recurring: number;
  total: number;
  paid: number;
  remaining: number;
  status: StatementStatus;
  payments: { id: string; paidOn: string; amount: number }[];
}

export interface CardStatementsYearView {
  year: number;
  today: string;
  cards: {
    card: StatementCardView;
    statements: StatementView[];
    total: number;
  }[];
  months: { month: string; total: number; paid: number }[];
  total: number;
}

export interface StatementChargeView {
  key: string;
  source: LedgerSource;
  transactionId: string | null;
  recurringTransactionId: string | null;
  date: string;
  description: string | null;
  category: CategoryRef | null;
  installment: number;
  installments: number;
  amount: number;
}

export interface CardStatementDetailView {
  card: StatementCardView;
  statement: StatementView;
  charges: StatementChargeView[];
}

function statementCardView(card: Card): StatementCardView {
  return {
    ...cardRef(card),
    closingDay: card.closingDay,
    dueDay: card.dueDay,
    creditLimit: card.creditLimit,
  };
}

export function statementView(statement: CardStatement): StatementView {
  return {
    month: statement.month.toString(),
    closingDate: statement.closingDate,
    dueDate: statement.dueDate,
    adjustment: money(statement.adjustment),
    installments: money(statement.installments),
    purchases: money(statement.purchases),
    recurring: money(statement.recurring),
    total: money(statement.total),
    paid: money(statement.paid),
    remaining: money(statement.total - statement.paid),
    status: statement.status,
    payments: statement.payments.map((payment) => ({
      id: payment.id!,
      paidOn: payment.paidOn,
      amount: payment.amount,
    })),
  };
}

export function cardStatementsYearView(
  year: number,
  months: YearMonth[],
  book: CardStatementBook,
  refs: ReferenceIndex,
  today: string,
): CardStatementsYearView {
  const cards = book.cardIds().flatMap((cardId) => {
    const card = refs.card(cardId);
    if (!card) return [];
    const statements = book.forCard(cardId);
    return [
      {
        card: statementCardView(card),
        statements: statements.map(statementView),
        total: money(statements.reduce((sum, s) => sum + s.total, 0)),
      },
    ];
  });

  const monthTotals = months.map((month) => {
    const statements = book.forMonth(month);
    return {
      month: month.toString(),
      total: money(statements.reduce((sum, s) => sum + s.total, 0)),
      paid: money(statements.reduce((sum, s) => sum + s.paid, 0)),
    };
  });

  return {
    year,
    today,
    cards,
    months: monthTotals,
    total: money(book.all().reduce((sum, s) => sum + s.total, 0)),
  };
}

export function cardStatementDetailView(
  card: Card,
  statement: CardStatement,
  refs: ReferenceIndex,
): CardStatementDetailView {
  return {
    card: statementCardView(card),
    statement: statementView(statement),
    charges: statement.charges.map((charge) => ({
      key: `${charge.entryKey}#${charge.installment}`,
      source: charge.source,
      transactionId: charge.transactionId,
      recurringTransactionId: charge.recurringTransactionId,
      date: charge.date,
      description: charge.description,
      category: refs.categoryRef(charge.categoryId),
      installment: charge.installment,
      installments: charge.installments,
      amount: money(charge.amount),
    })),
  };
}
