import { useAuth } from "@/features/auth/context/AuthContext";
import { useAsyncData, type AsyncData } from "@/lib/data/use-async-data";
import { useDataRevision } from "@/lib/data/data-revision";
import { reportsApi } from "../api/reports.api";
import type {
  AnnualView,
  CardStatementDetailView,
  CardStatementsYearView,
  LedgerView,
  SummaryPeriod,
  SummaryView,
} from "../types";

// Every report key carries the session and the data revision, so reports
// reload after any write and never leak across accounts.
function useReportKey(parts: Array<string | number> | null): {
  key: string | null;
  token: string;
} {
  const { session } = useAuth();
  const { revision } = useDataRevision();
  const token = session?.token ?? "";
  return {
    key: parts && token ? [...parts, revision, token].join("|") : null,
    token,
  };
}

function periodKey(period: SummaryPeriod): string {
  switch (period.type) {
    case "MONTH":
      return `month:${period.month}`;
    case "YEAR":
      return `year:${period.year}`;
    case "ALL":
      return "all";
  }
}

export function useLedger(month: string): AsyncData<LedgerView> {
  const { key, token } = useReportKey(["ledger", month]);
  return useAsyncData(key, () => reportsApi.ledger(month, token));
}

export function useSummary(period: SummaryPeriod): AsyncData<SummaryView> {
  const { key, token } = useReportKey(["summary", periodKey(period)]);
  return useAsyncData(key, () => reportsApi.summary(period, token));
}

export function useAnnual(year: number): AsyncData<AnnualView> {
  const { key, token } = useReportKey(["annual", year]);
  return useAsyncData(key, () => reportsApi.annual(year, token));
}

export function useCardStatements(year: number): AsyncData<CardStatementsYearView> {
  const { key, token } = useReportKey(["card-statements", year]);
  return useAsyncData(key, () => reportsApi.cardStatements(year, token));
}

export function useCardStatement(
  selection: { cardId: string; month: string } | null,
): AsyncData<CardStatementDetailView> {
  const { key, token } = useReportKey(
    selection ? ["card-statement", selection.cardId, selection.month] : null,
  );
  return useAsyncData(key, () =>
    reportsApi.cardStatement(selection!.cardId, selection!.month, token),
  );
}
