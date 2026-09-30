import { YearMonth } from '../../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../../shared/domain/payment/payment-method.enum';
import { StatementPayment } from '../../../card-statements/domain/entities/statement-payment.entity';
import { CategoryKind } from '../../../categories/domain/enums/category-kind.enum';
import { LedgerEntry, isCredit } from '../../domain/ledger';
import { CardRef, CategoryRef, ReferenceIndex, money } from './refs.view';

export type LedgerEntryKind = CategoryKind | 'CARD_PAYMENT';

export interface LedgerEntryView {
  key: string;
  source: 'TRANSACTION' | 'RECURRING' | 'CARD_PAYMENT';
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
  // Credit charges: the statement the (first installment of the) purchase
  // lands on. Card payments: the statement being paid.
  statementMonth: string | null;
  projected: boolean;
}

export interface LedgerView {
  month: string;
  currentMonth: string;
  entries: LedgerEntryView[];
}

export function ledgerView(
  month: YearMonth,
  currentMonth: YearMonth,
  entries: readonly LedgerEntry[],
  payments: readonly StatementPayment[],
  refs: ReferenceIndex,
): LedgerView {
  const entryViews = entries
    .filter((entry) => entry.month.equals(month))
    .map((entry): LedgerEntryView => {
      const card = entry.cardId ? refs.card(entry.cardId) : undefined;
      return {
        key: entry.key,
        source: entry.source,
        transactionId: entry.transactionId,
        recurringTransactionId: entry.recurringTransactionId,
        paymentId: null,
        date: entry.date,
        description: entry.description,
        amount: money(entry.amount),
        kind: entry.kind,
        category: refs.categoryRef(entry.categoryId),
        paymentMethod: entry.paymentMethod,
        card: refs.cardRef(entry.cardId),
        installments: entry.installments,
        statementMonth:
          card && isCredit(entry)
            ? card.statementMonthFor(entry.date).toString()
            : null,
        projected: entry.projected,
      };
    });

  const paymentViews = payments
    .filter((payment) => YearMonth.fromIsoDate(payment.paidOn).equals(month))
    .map((payment): LedgerEntryView => ({
      key: payment.id!,
      source: 'CARD_PAYMENT',
      transactionId: null,
      recurringTransactionId: null,
      paymentId: payment.id!,
      date: payment.paidOn,
      description: null,
      amount: payment.amount,
      kind: 'CARD_PAYMENT',
      category: null,
      paymentMethod: null,
      card: refs.cardRef(payment.cardId),
      installments: 1,
      statementMonth: payment.statementMonth.toString(),
      projected: false,
    }));

  return {
    month: month.toString(),
    currentMonth: currentMonth.toString(),
    entries: [...entryViews, ...paymentViews].sort(
      (a, b) => b.date.localeCompare(a.date) || a.key.localeCompare(b.key),
    ),
  };
}
