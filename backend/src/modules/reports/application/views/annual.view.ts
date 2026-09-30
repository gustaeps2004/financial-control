import { AnnualOverview, MonthStatus } from '../../domain/annual-overview';
import { CashFlowView, cashFlowView } from './refs.view';

export interface AnnualView {
  year: number;
  currentMonth: string;
  months: { month: string; status: MonthStatus; cashFlow: CashFlowView }[];
  realized: CashFlowView;
  withProjection: CashFlowView;
}

export function annualView(
  overview: AnnualOverview,
  currentMonth: string,
): AnnualView {
  return {
    year: overview.year,
    currentMonth,
    months: overview.months.map((month) => ({
      month: month.month.toString(),
      status: month.status,
      cashFlow: cashFlowView(month.cashFlow),
    })),
    realized: cashFlowView(overview.realized),
    withProjection: cashFlowView(overview.withProjection),
  };
}
