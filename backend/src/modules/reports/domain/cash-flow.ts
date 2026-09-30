import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { Cents, LedgerEntry, isCredit } from './ledger';

/**
 * Where the money of a period went, following the spreadsheet's panorama:
 * purchases charged to a card don't leave the account when made — the card
 * bill does, when paid.
 */
export interface CashFlow {
  income: Cents;
  // Fixed bills paid straight from the account.
  fixedBills: Cents;
  // Card bills paid (or, for a future month, the statements due then).
  cardBills: Cents;
  // Day-to-day spending paid straight from the account.
  cashExpenses: Cents;
  totalOut: Cents;
  savings: Cents;
  leftover: Cents;
  // Everything charged to a card in the period, whatever statement it
  // lands on.
  creditPurchases: Cents;
}

export function computeCashFlow(
  entries: readonly LedgerEntry[],
  cardBills: Cents,
): CashFlow {
  let income = 0;
  let fixedBills = 0;
  let cashExpenses = 0;
  let savings = 0;
  let creditPurchases = 0;

  for (const entry of entries) {
    if (isCredit(entry)) {
      creditPurchases += entry.amount;
      continue;
    }
    switch (entry.kind) {
      case CategoryKind.INCOME:
        income += entry.amount;
        break;
      case CategoryKind.FIXED_BILL:
        fixedBills += entry.amount;
        break;
      case CategoryKind.EXPENSE:
        cashExpenses += entry.amount;
        break;
      case CategoryKind.SAVINGS:
        savings += entry.amount;
        break;
    }
  }

  const totalOut = fixedBills + cardBills + cashExpenses;
  return {
    income,
    fixedBills,
    cardBills,
    cashExpenses,
    totalOut,
    savings,
    leftover: income - totalOut - savings,
    creditPurchases,
  };
}

/** A part of the income, or 0 when there was no income to compare with. */
export function shareOfIncome(amount: Cents, income: Cents): number {
  return income > 0 ? amount / income : 0;
}
