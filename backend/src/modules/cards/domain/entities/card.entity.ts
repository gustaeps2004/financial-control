import { BaseDomainEntity } from '../../../../shared/domain/base-domain-entity';
import {
  YearMonth,
  dayOfIsoDate,
} from '../../../../shared/domain/calendar/year-month';

/**
 * Statements are named after the month they are due in ("the October
 * statement"), which is also the month the bill is expected to be paid.
 */
export class Card extends BaseDomainEntity {
  userId!: string;
  brand!: string;
  mark!: string;
  swatch!: string;
  nickname!: string;
  creditLimit!: number;
  closingDay!: number;
  // null means the bill is due in the same month the statement closes.
  dueDay: number | null = null;
  openingBalance!: number;

  /**
   * The statement a purchase lands on: purchases up to and including the
   * closing day close that month; later ones roll to the next closing.
   */
  statementMonthFor(purchaseDate: string): YearMonth {
    const purchaseMonth = YearMonth.fromIsoDate(purchaseDate);
    const closingMonth =
      dayOfIsoDate(purchaseDate) <= this.closingDay
        ? purchaseMonth
        : purchaseMonth.plus(1);
    return closingMonth.plus(this.dueMonthOffset());
  }

  closingDateOf(statementMonth: YearMonth): string {
    return statementMonth.plus(-this.dueMonthOffset()).dateOn(this.closingDay);
  }

  dueDateOf(statementMonth: YearMonth): string | null {
    return this.dueDay === null ? null : statementMonth.dateOn(this.dueDay);
  }

  // A due day on or before the closing day can only fall in the following
  // month (e.g. closes on the 28th, due on the 5th).
  private dueMonthOffset(): number {
    return this.dueDay !== null && this.dueDay <= this.closingDay ? 1 : 0;
  }
}
