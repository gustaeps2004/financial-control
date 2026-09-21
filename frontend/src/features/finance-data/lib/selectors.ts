import { formatMoney } from "@/shared/lib/money";
import type { CardAccount } from "@/features/cards/types";
import type { Transaction } from "../types";

export const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function transactionsInMonth(
  transactions: Transaction[],
  year: number,
  month: number,
): Transaction[] {
  return transactions.filter((t) => t.year === year && (month < 0 || t.month === month));
}

export function sumByKind(transactions: Transaction[], kind: "in" | "out"): number {
  return transactions.filter((t) => t.kind === kind).reduce((sum, t) => sum + t.amount, 0);
}

export function categoryTotals(transactions: Transaction[]): Array<[string, number]> {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.kind !== "out") continue;
    totals.set(t.cat, (totals.get(t.cat) ?? 0) + t.amount);
  }
  return [...totals.entries()].sort((a, b) => b[1] - a[1]);
}

export function monthlySpendSeries(transactions: Transaction[], year: number): number[] {
  return MONTH_LABELS.map((_, month) =>
    transactions
      .filter((t) => t.year === year && t.month === month && t.kind === "out")
      .reduce((sum, t) => sum + t.amount, 0),
  );
}

export function cardBalance(card: CardAccount, monthTransactions: Transaction[]): number {
  const spent = monthTransactions
    .filter((t) => t.kind === "out" && t.cardId === card.id)
    .reduce((sum, t) => sum + t.amount, 0);
  return card.opening + spent;
}

export function methodLabel(
  transaction: Transaction,
  cards: CardAccount[],
): string {
  if (transaction.kind === "in") return "Income";
  if (transaction.method === "card") {
    const card = cards.find((c) => c.id === transaction.cardId);
    return card ? card.nick : "Card";
  }
  return { pix: "Pix", debit: "Debit", cash: "Cash" }[transaction.method] ?? transaction.method;
}

export function formatDay(day: number): string {
  return String(day).padStart(2, "0");
}

export function formatDateShort(day: number, month: number): string {
  return `${formatDay(day)}/${String(month + 1).padStart(2, "0")}`;
}

export { formatMoney };
