import { useAuth } from "@/features/auth/context/AuthContext";
import { useAsyncData } from "@/lib/data/use-async-data";
import { useDataRevision } from "@/lib/data/data-revision";
import { recurringApi } from "../api/recurring.api";
import type { RecurringTransaction, RecurringTransactionInput } from "../types";

export function useRecurringTransactions() {
  const { session } = useAuth();
  const { revision, notifyChanged } = useDataRevision();
  const token = session?.token ?? "";

  const list = useAsyncData(token ? `recurring|${revision}|${token}` : null, () =>
    recurringApi.list(token),
  );

  async function andRefresh<T>(action: Promise<T>): Promise<T> {
    try {
      return await action;
    } finally {
      notifyChanged();
    }
  }

  return {
    recurring: list.data ?? ([] as RecurringTransaction[]),
    isLoading: list.isLoading,
    error: list.error,
    createRecurring: (input: RecurringTransactionInput) =>
      andRefresh(recurringApi.create(input, token)),
    updateRecurring: (id: string, patch: Partial<RecurringTransactionInput>) =>
      andRefresh(recurringApi.update(id, patch, token)),
    removeRecurring: (id: string) => andRefresh(recurringApi.remove(id, token)),
  };
}
