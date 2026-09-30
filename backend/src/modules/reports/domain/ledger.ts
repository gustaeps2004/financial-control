import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { toCents } from '../../../shared/domain/money';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import { Category } from '../../categories/domain/entities/category.entity';
import { CategoryKind } from '../../categories/domain/enums/category-kind.enum';
import { RecurringTransaction } from '../../recurring-transactions/domain/entities/recurring-transaction.entity';
import { Transaction } from '../../transactions/domain/entities/transaction.entity';

/** Every amount in the reports domain is an integer number of cents. */
export type Cents = number;

export type LedgerSource = 'TRANSACTION' | 'RECURRING';

/**
 * One line of the month: either a transaction logged by hand or the
 * automatic occurrence of a recurring transaction for a given month.
 */
export interface LedgerEntry {
  key: string;
  source: LedgerSource;
  transactionId: string | null;
  recurringTransactionId: string | null;
  date: string;
  month: YearMonth;
  description: string | null;
  amount: Cents;
  categoryId: string;
  kind: CategoryKind;
  paymentMethod: PaymentMethod | null;
  cardId: string | null;
  installments: number;
  // An automatic occurrence in a month that has not arrived yet.
  projected: boolean;
}

export interface LedgerInput {
  transactions: readonly Transaction[];
  recurringTransactions: readonly RecurringTransaction[];
  categories: ReadonlyMap<string, Category>;
  // Months to post recurring occurrences in.
  recurringMonths: { from: YearMonth; to: YearMonth };
  currentMonth: YearMonth;
}

function overrideKey(recurringTransactionId: string, month: YearMonth): string {
  return `${recurringTransactionId}|${month.toString()}`;
}

/**
 * Merges logged transactions with the automatic occurrences of recurring
 * ones. A transaction linked to a recurring transaction replaces that
 * month's occurrence — the value logged by hand wins over the automatic one.
 */
export function buildLedger(input: LedgerInput): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  const overridden = new Set<string>();

  for (const transaction of input.transactions) {
    const category = input.categories.get(transaction.categoryId);
    if (!category) continue;

    if (transaction.recurringTransactionId) {
      overridden.add(
        overrideKey(transaction.recurringTransactionId, transaction.month),
      );
    }

    entries.push({
      key: transaction.id!,
      source: 'TRANSACTION',
      transactionId: transaction.id!,
      recurringTransactionId: transaction.recurringTransactionId,
      date: transaction.date,
      month: transaction.month,
      description: transaction.description,
      amount: toCents(transaction.amount),
      categoryId: transaction.categoryId,
      kind: category.kind,
      paymentMethod: transaction.paymentMethod,
      cardId: transaction.cardId,
      installments: transaction.installments,
      projected: false,
    });
  }

  const months = YearMonth.range(
    input.recurringMonths.from,
    input.recurringMonths.to,
  );
  for (const recurring of input.recurringTransactions) {
    const category = input.categories.get(recurring.categoryId);
    if (!category) continue;

    for (const month of months) {
      if (
        !recurring.isActiveIn(month) ||
        overridden.has(overrideKey(recurring.id!, month))
      ) {
        continue;
      }

      entries.push({
        key: overrideKey(recurring.id!, month),
        source: 'RECURRING',
        transactionId: null,
        recurringTransactionId: recurring.id!,
        date: recurring.occurrenceDateIn(month),
        month,
        description: recurring.description,
        amount: toCents(recurring.amount),
        categoryId: recurring.categoryId,
        kind: category.kind,
        paymentMethod: recurring.paymentMethod,
        cardId: recurring.cardId,
        installments: 1,
        projected: month.isAfter(input.currentMonth),
      });
    }
  }

  return entries.sort(
    (a, b) => b.date.localeCompare(a.date) || a.key.localeCompare(b.key),
  );
}

/** Charged to a card: the money only leaves when the statement is paid. */
export function isCredit(entry: LedgerEntry): boolean {
  return entry.paymentMethod === PaymentMethod.CREDIT;
}
