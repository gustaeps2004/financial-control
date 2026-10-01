import type { CategoryKind } from "@/features/categories/types";
import type { PaymentMethod } from "@/shared/lib/payment-methods";

// Mirrors the API's report views. References carry their own display data
// because they may point at categories or cards deleted since.

export interface CategoryRef {
  id: string;
  name: string;
  kind: CategoryKind;
  deleted: boolean;
}

export interface CardRef {
  id: string;
  nickname: string;
  brand: string;
  mark: string;
  swatch: string;
  deleted: boolean;
}

export interface CashFlow {
  income: number;
  // Fixed bills paid straight from the account.
  fixedBills: number;
  // Card bills paid — or, for a future month, the statements due then.
  cardBills: number;
  // Day-to-day spending paid straight from the account.
  cashExpenses: number;
  totalOut: number;
  savings: number;
  leftover: number;
  // Everything charged to a card, whatever statement it lands on.
  creditPurchases: number;
}

export type LedgerSource = "TRANSACTION" | "RECURRING" | "CARD_PAYMENT";
export type LedgerEntryKind = CategoryKind | "CARD_PAYMENT";

export interface LedgerEntry {
  key: string;
  source: LedgerSource;
  transactionId: string | null;
  recurringTransactionId: string | null;
  paymentId: string | null;
  date: string;
  description: string | null;
  amount: number;
  kind: LedgerEntryKind;
  category: CategoryRef | null;
  paymentMethod: PaymentMethod | null;
  card: CardRef | null;
  installments: number;
  statementMonth: string | null;
  projected: boolean;
}

export interface LedgerView {
  month: string;
  currentMonth: string;
  entries: LedgerEntry[];
}

export type SummaryPeriod =
  | { type: "MONTH"; month: string }
  | { type: "YEAR"; year: number }
  | { type: "ALL" };

export interface CategoryLine {
  category: CategoryRef;
  total: number;
  share: number;
}

export interface SplitCategoryLine extends CategoryLine {
  cash: number;
  credit: number;
}

export interface SummaryView {
  period: { type: SummaryPeriod["type"]; month: string | null; year: number | null };
  currentMonth: string;
  projected: boolean;
  cashFlow: CashFlow & { savingsRate: number; committedRate: number };
  income: CategoryLine[];
  savings: CategoryLine[];
  fixedBills: SplitCategoryLine[];
  expenses: SplitCategoryLine[];
  cards: {
    card: CardRef;
    paid: number;
    carried: number;
    newCharges: number;
    statementTotal: number;
    outstanding: number;
  }[];
  paymentMethods: { paymentMethod: PaymentMethod | null; total: number; share: number }[];
  accounts: { card: CardRef | null; total: number; debit: number; credit: number }[];
}

export type MonthStatus = "REALIZED" | "PROJECTED";

export interface AnnualView {
  year: number;
  currentMonth: string;
  months: { month: string; status: MonthStatus; cashFlow: CashFlow }[];
  realized: CashFlow;
  withProjection: CashFlow;
}

export type StatementStatus = "PAID" | "OVERDUE" | "CLOSED" | "OPEN" | "UPCOMING" | "EMPTY";

export interface StatementCard extends CardRef {
  closingDay: number;
  dueDay: number | null;
  creditLimit: number;
}

export interface Statement {
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
  cards: { card: StatementCard; statements: Statement[]; total: number }[];
  months: { month: string; total: number; paid: number }[];
  total: number;
}

export interface StatementCharge {
  key: string;
  source: "TRANSACTION" | "RECURRING";
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
  card: StatementCard;
  statement: Statement;
  charges: StatementCharge[];
}
