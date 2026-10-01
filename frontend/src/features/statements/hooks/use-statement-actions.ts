import { useAuth } from "@/features/auth/context/AuthContext";
import { useDataRevision } from "@/lib/data/data-revision";
import { ApiError } from "@/lib/http/api-error";
import { cardStatementsApi } from "../api/card-statements.api";

/** Writes on card statements; every one of them reloads the reports. */
export function useStatementActions() {
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
    /** Sets what a statement carries in; zero removes it. */
    setAdjustment: async (cardId: string, month: string, amount: number) => {
      if (amount !== 0) {
        await andRefresh(cardStatementsApi.setAdjustment(cardId, month, amount, token));
        return;
      }
      try {
        await andRefresh(cardStatementsApi.removeAdjustment(cardId, month, token));
      } catch (err) {
        // Clearing a statement that had nothing carried in is a no-op.
        if (!(err instanceof ApiError && err.status === 404)) throw err;
      }
    },
    registerPayment: (cardId: string, month: string, payment: { paidOn: string; amount: number }) =>
      andRefresh(cardStatementsApi.registerPayment(cardId, month, payment, token)),
    removePayment: (paymentId: string) =>
      andRefresh(cardStatementsApi.removePayment(paymentId, token)),
  };
}
