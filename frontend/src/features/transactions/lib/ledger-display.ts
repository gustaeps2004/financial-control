import { formatYearMonth } from "@/shared/lib/dates";
import { PAYMENT_METHOD_LABELS } from "@/shared/lib/payment-methods";
import type { LedgerEntry } from "@/features/reports/types";

/**
 * From the account's point of view: money in is positive, everything that
 * leaves (spending, bills, savings, card bills) negative — so refunds and
 * money taken back from savings come out positive.
 */
export function signedAmount(entry: LedgerEntry): number {
  return entry.kind === "INCOME" ? entry.amount : -entry.amount;
}

export function entryTitle(entry: LedgerEntry): string {
  if (entry.source === "CARD_PAYMENT") return `${entry.card?.nickname ?? "Card"} bill`;
  return entry.description ?? entry.category?.name ?? "—";
}

export function entryDetail(entry: LedgerEntry): string | null {
  if (entry.source === "CARD_PAYMENT") {
    return entry.statementMonth
      ? `Pays the ${formatYearMonth(entry.statementMonth)} statement`
      : null;
  }
  if (entry.source === "RECURRING") {
    return entry.projected ? "Expected — repeats every month" : "Posted automatically every month";
  }
  const parts: string[] = [];
  if (entry.recurringTransactionId) parts.push("This month's value of a recurring item");
  if (entry.installments > 1) parts.push(`${entry.installments}× installments`);
  if (entry.statementMonth) parts.push(`on the ${formatYearMonth(entry.statementMonth)} statement`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function paidWithLabel(entry: LedgerEntry): string {
  if (entry.source === "CARD_PAYMENT") return "Card bill";
  const method = entry.paymentMethod ? PAYMENT_METHOD_LABELS[entry.paymentMethod] : null;
  return [method, entry.card?.nickname].filter(Boolean).join(" · ") || "—";
}
