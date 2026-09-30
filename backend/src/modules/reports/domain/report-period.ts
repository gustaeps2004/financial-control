import { YearMonth } from '../../../shared/domain/calendar/year-month';

/**
 * A month, a year, or everything. Only a single month shows projections;
 * years and "everything" add up what has already happened.
 */
export type ReportPeriod =
  | { type: 'MONTH'; month: YearMonth }
  | { type: 'YEAR'; year: number }
  | { type: 'ALL' };

export function periodIncludes(
  period: ReportPeriod,
  month: YearMonth,
): boolean {
  switch (period.type) {
    case 'MONTH':
      return month.equals(period.month);
    case 'YEAR':
      return month.year === period.year;
    case 'ALL':
      return true;
  }
}

export function includesProjections(period: ReportPeriod): boolean {
  return period.type === 'MONTH';
}
