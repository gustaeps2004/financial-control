export type PaymentMethod = "card" | "pix" | "debit" | "cash";

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
  recurring: RecurringItem[];
  transactions: Transaction[];
}

export const EMPTY_FINANCE_DATA: FinanceData = {
  recurring: [],
  transactions: [],
};
