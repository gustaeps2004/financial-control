import type { Messages } from "@/lib/i18n/messages/en";
import type { LedgerEntry } from "@/features/reports/types";

/**
 * From the account's point of view: money in is positive, everything that
 * leaves (spending, bills, savings, card bills) negative — so refunds and
 * money taken back from savings come out positive.
 */
export function signedAmount(entry: LedgerEntry): number {
  return entry.kind === "INCOME" ? entry.amount : -entry.amount;
}

export function entryTitle(entry: LedgerEntry, t: Messages): string {
  if (entry.source === "CARD_PAYMENT") {
    return t.transactions.ledger.cardBillOf(entry.card?.nickname ?? null);
  }
  return entry.description ?? entry.category?.name ?? "—";
}

export function entryDetail(entry: LedgerEntry, t: Messages): string | null {
  const labels = t.transactions.ledger;
  if (entry.source === "CARD_PAYMENT") {
    return entry.statementMonth ? labels.paysStatement(entry.statementMonth) : null;
  }
  if (entry.source === "RECURRING") {
    return entry.projected ? labels.expected : labels.postedAutomatically;
  }
  const parts: string[] = [];
  if (entry.recurringTransactionId) parts.push(labels.recurringValue);
  if (entry.installments > 1) parts.push(labels.installments(entry.installments));
  if (entry.statementMonth) parts.push(labels.onStatement(entry.statementMonth));
  return parts.length > 0 ? parts.join(" · ") : null;
}

export function paidWithLabel(entry: LedgerEntry, t: Messages): string {
  if (entry.source === "CARD_PAYMENT") return t.transactions.ledger.cardBill;
  const method = entry.paymentMethod ? t.paymentMethods[entry.paymentMethod] : null;
  return [method, entry.card?.nickname].filter(Boolean).join(" · ") || "—";
}
