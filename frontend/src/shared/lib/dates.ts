// Months travel as "YYYY-MM" strings and days as "YYYY-MM-DD", exactly like
// the API; both sort correctly as plain strings. Names of months, which
// depend on the language, come from the dictionaries (t.dates).

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Today's date on this device, as YYYY-MM-DD. */
export function todayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function currentYearMonth(): string {
  return todayIso().slice(0, 7);
}

export function yearMonthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function parseYearMonth(yearMonth: string): { year: number; month: number } {
  const [year, month] = yearMonth.split("-").map(Number);
  return { year: year!, month: month! };
}

export function toYearMonth(year: number, month: number): string {
  const index = year * 12 + (month - 1);
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

export function addMonths(yearMonth: string, months: number): string {
  const { year, month } = parseYearMonth(yearMonth);
  return toYearMonth(year, month + months);
}

export function monthsOfYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, index) => toYearMonth(year, index + 1));
}

/** "06/09" — day and month, the way the spreadsheet shows dates. */
export function formatDayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function daysInMonth(yearMonth: string): number {
  const { year, month } = parseYearMonth(yearMonth);
  return new Date(year, month, 0).getDate();
}

/** The ISO date of `day` in the month, clamped to the month's length. */
export function dateInMonth(yearMonth: string, day: number): string {
  const clamped = Math.min(Math.max(day, 1), daysInMonth(yearMonth));
  return `${yearMonth}-${pad(clamped)}`;
}
