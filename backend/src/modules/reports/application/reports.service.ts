import { Injectable } from '@nestjs/common';
import { Clock } from '../../../shared/clock/clock';
import { YearMonth } from '../../../shared/domain/calendar/year-month';
import { PaymentMethod } from '../../../shared/domain/payment/payment-method.enum';
import { CardStatementsService } from '../../card-statements/application/card-statements.service';
import { StatementAdjustment } from '../../card-statements/domain/entities/statement-adjustment.entity';
import { StatementPayment } from '../../card-statements/domain/entities/statement-payment.entity';
import { CardsService } from '../../cards/application/cards.service';
import { CardNotFoundException } from '../../cards/domain/exceptions/card-not-found.exception';
import { CategoriesService } from '../../categories/application/categories.service';
import { RecurringTransactionsService } from '../../recurring-transactions/application/recurring-transactions.service';
import { TransactionsService } from '../../transactions/application/transactions.service';
import {
  MAX_INSTALLMENTS,
  Transaction,
} from '../../transactions/domain/entities/transaction.entity';
import { buildAnnualOverview } from '../domain/annual-overview';
import {
  CardStatementBook,
  buildCardStatements,
} from '../domain/card-statements';
import { LedgerEntry, buildLedger } from '../domain/ledger';
import { buildPeriodSummary } from '../domain/period-summary';
import { ReportPeriod } from '../domain/report-period';
import { AnnualView, annualView } from './views/annual.view';
import {
  CardStatementDetailView,
  CardStatementsYearView,
  cardStatementDetailView,
  cardStatementsYearView,
} from './views/card-statements.view';
import { LedgerView, ledgerView } from './views/ledger.view';
import { ReferenceIndex } from './views/refs.view';
import { SummaryView, summaryView } from './views/summary.view';

// A statement can hold credit purchases made up to two months before it:
// after a closing day, on a card that is due the month after it closes.
const STATEMENT_LOOKBACK_MONTHS = 2;

interface MonthRange {
  from: YearMonth;
  to: YearMonth;
}

interface ReportContext {
  today: string;
  currentMonth: YearMonth;
  months: YearMonth[];
  refs: ReferenceIndex;
  // Also covers the lookback months, so statements see every charge that
  // lands on them.
  entries: LedgerEntry[];
  adjustments: StatementAdjustment[];
  payments: StatementPayment[];
}

@Injectable()
export class ReportsService {
  constructor(
    private readonly clock: Clock,
    private readonly categoriesService: CategoriesService,
    private readonly cardsService: CardsService,
    private readonly transactionsService: TransactionsService,
    private readonly recurringTransactionsService: RecurringTransactionsService,
    private readonly cardStatementsService: CardStatementsService,
  ) {}

  /** Everything in a month: logged, automatic and card bill payments. */
  async ledger(userId: string, month: YearMonth): Promise<LedgerView> {
    const context = await this.loadContext(userId, { from: month, to: month });
    return ledgerView(
      month,
      context.currentMonth,
      context.entries,
      context.payments,
      context.refs,
    );
  }

  /** The spreadsheet's "Resumo" for a month, a year or everything. */
  async summary(userId: string, period: ReportPeriod): Promise<SummaryView> {
    const context = await this.loadContext(userId, rangeOf(period));
    const summary = buildPeriodSummary({
      period,
      currentMonth: context.currentMonth,
      entries: context.entries,
      statements: this.statementsOf(context),
      payments: context.payments,
    });
    return summaryView(summary, context.refs, context.currentMonth.toString());
  }

  /** The spreadsheet's "Visão Anual". */
  async annual(userId: string, year: number): Promise<AnnualView> {
    const context = await this.loadContext(userId, yearRange(year));
    const overview = buildAnnualOverview({
      year,
      currentMonth: context.currentMonth,
      entries: context.entries,
      statements: this.statementsOf(context),
      payments: context.payments,
    });
    return annualView(overview, context.currentMonth.toString());
  }

  /** The spreadsheet's "Cartões": every card's statements over a year. */
  async cardStatements(
    userId: string,
    year: number,
  ): Promise<CardStatementsYearView> {
    const context = await this.loadContext(userId, yearRange(year));
    return cardStatementsYearView(
      year,
      context.months,
      this.statementsOf(context),
      context.refs,
      context.today,
    );
  }

  async cardStatement(
    userId: string,
    cardId: string,
    month: YearMonth,
  ): Promise<CardStatementDetailView> {
    const context = await this.loadContext(userId, { from: month, to: month });
    const card = context.refs.card(cardId);
    const statement = this.statementsOf(context).get(cardId, month);
    if (!card || !statement) {
      throw new CardNotFoundException();
    }
    return cardStatementDetailView(card, statement, context.refs);
  }

  private statementsOf(context: ReportContext): CardStatementBook {
    return buildCardStatements({
      cards: context.refs.cardList(),
      entries: context.entries,
      adjustments: context.adjustments,
      payments: context.payments,
      months: context.months,
      today: context.today,
    });
  }

  /** `range` null means everything the user ever recorded. */
  private async loadContext(
    userId: string,
    range: MonthRange | null,
  ): Promise<ReportContext> {
    const today = this.clock.today();
    const currentMonth = YearMonth.fromIsoDate(today);

    const [
      categories,
      cards,
      recurringTransactions,
      occurrencePayments,
      adjustments,
      payments,
      transactions,
    ] = await Promise.all([
      this.categoriesService.findAllIncludingDeleted(userId),
      this.cardsService.findAllIncludingDeleted(userId),
      this.recurringTransactionsService.findAll(userId),
      this.recurringTransactionsService.listOccurrencePayments(userId),
      this.cardStatementsService.listAdjustments(userId),
      this.cardStatementsService.listPayments(userId),
      range
        ? this.loadTransactionsAround(userId, range)
        : this.transactionsService.findAll(userId),
    ]);

    const months = range ?? {
      from: earliest([
        currentMonth,
        ...transactions.map((transaction) => transaction.month),
        ...recurringTransactions.map((recurring) => recurring.startMonth),
        ...payments.map((payment) => YearMonth.fromIsoDate(payment.paidOn)),
      ]),
      to: latest([
        currentMonth,
        ...transactions.map((transaction) => transaction.month),
      ]),
    };
    const refs = new ReferenceIndex(categories, cards);

    return {
      today,
      currentMonth,
      months: YearMonth.range(months.from, months.to),
      refs,
      entries: buildLedger({
        transactions,
        recurringTransactions,
        occurrencePayments,
        categories: refs.categoryMap(),
        recurringMonths: {
          from: months.from.plus(-STATEMENT_LOOKBACK_MONTHS),
          to: months.to,
        },
        currentMonth,
      }),
      adjustments,
      payments,
    };
  }

  // Everything in (and just before) the range, plus older purchases split
  // in enough installments to still reach it.
  private async loadTransactionsAround(
    userId: string,
    range: MonthRange,
  ): Promise<Transaction[]> {
    const lookbackFrom = range.from.plus(-STATEMENT_LOOKBACK_MONTHS);
    const [recent, olderInstallmentPurchases] = await Promise.all([
      this.transactionsService.findAll(userId, {
        from: lookbackFrom.firstDay(),
        to: range.to.lastDay(),
      }),
      this.transactionsService.findAll(userId, {
        from: lookbackFrom.plus(-MAX_INSTALLMENTS).firstDay(),
        to: lookbackFrom.plus(-1).lastDay(),
        paymentMethod: PaymentMethod.CREDIT,
        minInstallments: 2,
      }),
    ]);
    return [...recent, ...olderInstallmentPurchases];
  }
}

function rangeOf(period: ReportPeriod): MonthRange | null {
  switch (period.type) {
    case 'MONTH':
      return { from: period.month, to: period.month };
    case 'YEAR':
      return yearRange(period.year);
    case 'ALL':
      return null;
  }
}

function yearRange(year: number): MonthRange {
  return { from: YearMonth.of(year, 1), to: YearMonth.of(year, 12) };
}

function earliest(months: YearMonth[]): YearMonth {
  return months.reduce((min, month) => (month.isBefore(min) ? month : min));
}

function latest(months: YearMonth[]): YearMonth {
  return months.reduce((max, month) => (month.isAfter(max) ? month : max));
}
