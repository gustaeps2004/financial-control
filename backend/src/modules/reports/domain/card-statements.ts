import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { toCents } from '../../../shared/domain/money';
import { Card } from '../../cards/domain/entities/card.entity';
import { StatementAdjustment } from '../../card-statements/domain/entities/statement-adjustment.entity';
import { StatementPayment } from '../../card-statements/domain/entities/statement-payment.entity';
import { Cents, LedgerEntry, LedgerSource, isCredit } from './ledger';

export type StatementStatus =
  'PAID' | 'OVERDUE' | 'CLOSED' | 'OPEN' | 'UPCOMING' | 'EMPTY';

/** One installment of a credit charge, as it shows on a statement. */
export interface StatementCharge {
  entryKey: string;
  source: LedgerSource;
  transactionId: string | null;
  recurringTransactionId: string | null;
  date: string;
  description: string | null;
  categoryId: string;
  installment: number; // 1-based
  installments: number;
  amount: Cents;
}

export interface CardStatement {
  cardId: string;
  month: YearMonth;
  closingDate: string;
  dueDate: string | null;
  // Carried in without being logged here (spreadsheet: "valor inicial").
  adjustment: Cents;
  // Later installments of purchases made in earlier cycles.
  installments: Cents;
  // Purchases made in this statement's cycle (their first installment).
  purchases: Cents;
  // Recurring charges of this cycle, e.g. subscriptions.
  recurring: Cents;
  total: Cents;
  paid: Cents;
  status: StatementStatus;
  charges: StatementCharge[];
  payments: StatementPayment[];
}

/**
 * Splits a purchase into installments the way card issuers do: equal parts,
 * with the rounding difference on the first one.
 */
export function splitInstallments(total: Cents, count: number): Cents[] {
  const base = Math.trunc(total / count);
  const parts = Array.from({ length: count }, () => base);
  parts[0] += total - base * count;
  return parts;
}

export class CardStatementBook {
  private readonly statements = new Map<string, CardStatement>();

  static key(cardId: string, month: YearMonth): string {
    return `${cardId}|${month.toString()}`;
  }

  add(statement: CardStatement): void {
    this.statements.set(
      CardStatementBook.key(statement.cardId, statement.month),
      statement,
    );
  }

  get(cardId: string, month: YearMonth): CardStatement | undefined {
    return this.statements.get(CardStatementBook.key(cardId, month));
  }

  all(): CardStatement[] {
    return [...this.statements.values()];
  }

  forMonth(month: YearMonth): CardStatement[] {
    return this.all().filter((statement) => statement.month.equals(month));
  }

  forCard(cardId: string): CardStatement[] {
    return this.all()
      .filter((statement) => statement.cardId === cardId)
      .sort((a, b) => a.month.compareTo(b.month));
  }

  cardIds(): string[] {
    return [...new Set(this.all().map((statement) => statement.cardId))];
  }
}

export interface CardStatementsInput {
  cards: readonly Card[];
  entries: readonly LedgerEntry[];
  adjustments: readonly StatementAdjustment[];
  payments: readonly StatementPayment[];
  months: readonly YearMonth[];
  today: string; // YYYY-MM-DD
}

/**
 * The statements of every card for the given months. Each credit charge
 * lands on the statement its card assigns to the purchase date, and each
 * further installment on the following statements. Removed cards only show
 * up when something still lands on them.
 */
export function buildCardStatements(
  input: CardStatementsInput,
): CardStatementBook {
  const months = new Map(
    input.months.map((month) => [month.toString(), month]),
  );
  const cardsById = new Map(input.cards.map((card) => [card.id!, card]));

  const charges = new Map<string, StatementCharge[]>();
  for (const entry of input.entries) {
    const card = entry.cardId ? cardsById.get(entry.cardId) : undefined;
    if (!card || !isCredit(entry)) continue;

    const firstMonth = card.statementMonthFor(entry.date);
    splitInstallments(entry.amount, entry.installments).forEach(
      (amount, index) => {
        const month = firstMonth.plus(index);
        if (!months.has(month.toString())) return;

        const key = CardStatementBook.key(card.id!, month);
        charges.set(key, [
          ...(charges.get(key) ?? []),
          {
            entryKey: entry.key,
            source: entry.source,
            transactionId: entry.transactionId,
            recurringTransactionId: entry.recurringTransactionId,
            date: entry.date,
            description: entry.description,
            categoryId: entry.categoryId,
            installment: index + 1,
            installments: entry.installments,
            amount,
          },
        ]);
      },
    );
  }

  const adjustments = new Map<string, Cents>();
  for (const adjustment of input.adjustments) {
    if (!months.has(adjustment.statementMonth.toString())) continue;
    const key = CardStatementBook.key(
      adjustment.cardId,
      adjustment.statementMonth,
    );
    adjustments.set(
      key,
      (adjustments.get(key) ?? 0) + toCents(adjustment.amount),
    );
  }

  const payments = new Map<string, StatementPayment[]>();
  for (const payment of input.payments) {
    if (!months.has(payment.statementMonth.toString())) continue;
    const key = CardStatementBook.key(payment.cardId, payment.statementMonth);
    payments.set(key, [...(payments.get(key) ?? []), payment]);
  }

  const cardsWithActivity = new Set(
    [...charges.keys(), ...adjustments.keys(), ...payments.keys()].map(
      (key) => key.split('|')[0],
    ),
  );

  const book = new CardStatementBook();
  for (const card of input.cards) {
    if (card.deletedAt !== null && !cardsWithActivity.has(card.id!)) continue;

    for (const month of input.months) {
      const key = CardStatementBook.key(card.id!, month);
      const statementCharges = (charges.get(key) ?? []).sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const statementPayments = payments.get(key) ?? [];

      const sumOf = (predicate: (charge: StatementCharge) => boolean) =>
        statementCharges
          .filter(predicate)
          .reduce((sum, charge) => sum + charge.amount, 0);
      const adjustment = adjustments.get(key) ?? 0;
      const installments = sumOf((charge) => charge.installment > 1);
      const purchases = sumOf(
        (charge) => charge.installment === 1 && charge.source === 'TRANSACTION',
      );
      const recurring = sumOf(
        (charge) => charge.installment === 1 && charge.source === 'RECURRING',
      );
      const total = adjustment + installments + purchases + recurring;
      const paid = statementPayments.reduce(
        (sum, payment) => sum + toCents(payment.amount),
        0,
      );

      const statement: CardStatement = {
        cardId: card.id!,
        month,
        closingDate: card.closingDateOf(month),
        dueDate: card.dueDateOf(month),
        adjustment,
        installments,
        purchases,
        recurring,
        total,
        paid,
        status: 'EMPTY',
        charges: statementCharges,
        payments: statementPayments,
      };
      statement.status = statusOf(statement, card, input.today);
      book.add(statement);
    }
  }

  return book;
}

function statusOf(
  statement: CardStatement,
  card: Card,
  today: string,
): StatementStatus {
  const { total, paid } = statement;
  if ((total > 0 || paid > 0) && paid >= total) return 'PAID';
  if (total <= 0) return 'EMPTY';

  // Purchases on the closing day itself still land on this statement.
  if (today > statement.closingDate) {
    return statement.dueDate !== null && today > statement.dueDate
      ? 'OVERDUE'
      : 'CLOSED';
  }
  return today > card.closingDateOf(statement.month.plus(-1))
    ? 'OPEN'
    : 'UPCOMING';
}
