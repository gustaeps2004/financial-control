export type PaymentMethod = "card" | "pix" | "debit" | "cash";

export interface CardAccount {
  id: string;
  brand: string;
  mark: string;
  swatch: string;
  nick: string;
  last4: string;
  limit: number;
  closeDay: string;
  opening: number;
}

export interface RecurringItem {
  id: string;
  name: string;
  cat: string;
  day: string;
  amount: number;
}

export interface Transaction {
  id: string;
  year: number;
  month: number; // 0-11
  day: number;
  desc: string;
  cat: string;
  amount: number;
  kind: "in" | "out";
  method: PaymentMethod;
  cardId: string | null;
}

export interface FinanceData {
  categories: string[];
  cards: CardAccount[];
  recurring: RecurringItem[];
  transactions: Transaction[];
}

export const EMPTY_FINANCE_DATA: FinanceData = {
  categories: [],
  cards: [],
  recurring: [],
  transactions: [],
};
