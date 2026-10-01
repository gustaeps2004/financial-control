import { apiClient, withAuth } from "@/lib/http/api-client";
import type {
  AnnualView,
  CardStatementDetailView,
  CardStatementsYearView,
  LedgerView,
  SummaryPeriod,
  SummaryView,
} from "../types";

function summaryQuery(period: SummaryPeriod): string {
  switch (period.type) {
    case "MONTH":
      return `?month=${period.month}`;
    case "YEAR":
      return `?year=${period.year}`;
    case "ALL":
      return "";
  }
}

export const reportsApi = {
  ledger: (month: string, token: string) =>
    apiClient.get<LedgerView>(`/reports/ledger?month=${month}`, withAuth(token)),
  summary: (period: SummaryPeriod, token: string) =>
    apiClient.get<SummaryView>(`/reports/summary${summaryQuery(period)}`, withAuth(token)),
  annual: (year: number, token: string) =>
    apiClient.get<AnnualView>(`/reports/annual?year=${year}`, withAuth(token)),
  cardStatements: (year: number, token: string) =>
    apiClient.get<CardStatementsYearView>(
      `/reports/card-statements?year=${year}`,
      withAuth(token),
    ),
  cardStatement: (cardId: string, month: string, token: string) =>
    apiClient.get<CardStatementDetailView>(
      `/reports/card-statements/${cardId}/${month}`,
      withAuth(token),
    ),
};
