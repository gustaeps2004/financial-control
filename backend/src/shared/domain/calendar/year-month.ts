const ISO_MONTH = /^(\d{4})-(\d{2})$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "YYYY-MM" with a real month, for request validation. */
export const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0');
}

/**
 * A calendar month with no time zone attached ("2026-10"). Money in this app
 * is always reported per calendar month, so this is the unit every period,
 * statement and projection is expressed in.
 */
export class YearMonth {
  private constructor(
    readonly year: number,
    readonly month: number, // 1-12
  ) {}

  /** Month overflow is normalized: of(2026, 13) is 2027-01. */
  static of(year: number, month: number): YearMonth {
    const index = year * 12 + (month - 1);
    return YearMonth.fromIndex(index);
  }

  /** Parses "YYYY-MM". */
  static parse(value: string): YearMonth {
    const match = ISO_MONTH.exec(value);
    const month = match ? Number(match[2]) : 0;
    if (!match || month < 1 || month > 12) {
      throw new RangeError(`Invalid year-month "${value}"`);
    }
    return new YearMonth(Number(match[1]), month);
  }

  /** The month an ISO date ("YYYY-MM-DD") falls in. */
  static fromIsoDate(date: string): YearMonth {
    const match = ISO_DATE.exec(date);
    if (!match) {
      throw new RangeError(`Invalid ISO date "${date}"`);
    }
    return YearMonth.of(Number(match[1]), Number(match[2]));
  }

  static isValid(value: string): boolean {
    const match = ISO_MONTH.exec(value);
    const month = match ? Number(match[2]) : 0;
    return match !== null && month >= 1 && month <= 12;
  }

  /** Every month from `from` to `to`, both included. */
  static range(from: YearMonth, to: YearMonth): YearMonth[] {
    const months: YearMonth[] = [];
    for (let index = from.index; index <= to.index; index += 1) {
      months.push(YearMonth.fromIndex(index));
    }
    return months;
  }

  private static fromIndex(index: number): YearMonth {
    const year = Math.floor(index / 12);
    return new YearMonth(year, index - year * 12 + 1);
  }

  /** Months since year 0 — handy for ordering and distance math. */
  get index(): number {
    return this.year * 12 + (this.month - 1);
  }

  plus(months: number): YearMonth {
    return YearMonth.fromIndex(this.index + months);
  }

  monthsUntil(other: YearMonth): number {
    return other.index - this.index;
  }

  compareTo(other: YearMonth): number {
    return this.index - other.index;
  }

  equals(other: YearMonth): boolean {
    return this.index === other.index;
  }

  isBefore(other: YearMonth): boolean {
    return this.index < other.index;
  }

  isAfter(other: YearMonth): boolean {
    return this.index > other.index;
  }

  daysInMonth(): number {
    return new Date(Date.UTC(this.year, this.month, 0)).getUTCDate();
  }

  /** The ISO date of `day` in this month, clamped to the month's last day. */
  dateOn(day: number): string {
    const clamped = Math.min(Math.max(day, 1), this.daysInMonth());
    return `${pad(this.year, 4)}-${pad(this.month)}-${pad(clamped)}`;
  }

  firstDay(): string {
    return this.dateOn(1);
  }

  lastDay(): string {
    return this.dateOn(this.daysInMonth());
  }

  toString(): string {
    return `${pad(this.year, 4)}-${pad(this.month)}`;
  }

  toJSON(): string {
    return this.toString();
  }
}

/** Day of the month of an ISO date ("YYYY-MM-DD"). */
export function dayOfIsoDate(date: string): number {
  const match = ISO_DATE.exec(date);
  if (!match) {
    throw new RangeError(`Invalid ISO date "${date}"`);
  }
  return Number(match[3]);
}
