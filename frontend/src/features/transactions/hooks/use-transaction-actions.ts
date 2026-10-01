import { useAuth } from "@/features/auth/context/AuthContext";
import { cardStatementsApi } from "@/features/statements/api/card-statements.api";
import { useDataRevision } from "@/lib/data/data-revision";
import { transactionsApi } from "../api/transactions.api";
import type { TransactionInput } from "../types";

/** Writes that change the month; every one of them reloads the reports. */
export function useTransactionActions() {
  const { session } = useAuth();
  const { notifyChanged } = useDataRevision();
  const token = session?.token ?? "";

  async function andRefresh<T>(action: Promise<T>): Promise<T> {
    try {
      return await action;
    } finally {
      notifyChanged();
    }
  }

  return {
    createTransaction: (input: TransactionInput) =>
      andRefresh(transactionsApi.create(input, token)),
    updateTransaction: (id: string, input: Partial<TransactionInput>) =>
      andRefresh(transactionsApi.update(id, input, token)),
    removeTransaction: (id: string) => andRefresh(transactionsApi.remove(id, token)),
    removeStatementPayment: (id: string) =>
      andRefresh(cardStatementsApi.removePayment(id, token)),
  };
}
