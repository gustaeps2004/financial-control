import { apiClient, withAuth } from "@/lib/http/api-client";
import type { RecurringTransaction, RecurringTransactionInput } from "../types";

export const recurringApi = {
  list: (token: string) =>
    apiClient.get<RecurringTransaction[]>("/recurring-transactions", withAuth(token)),
  create: (input: RecurringTransactionInput, token: string) =>
    apiClient.post<RecurringTransaction, RecurringTransactionInput>(
      "/recurring-transactions",
      input,
      withAuth(token),
    ),
  update: (id: string, patch: Partial<RecurringTransactionInput>, token: string) =>
    apiClient.patch<RecurringTransaction, Partial<RecurringTransactionInput>>(
      `/recurring-transactions/${id}`,
      patch,
      withAuth(token),
    ),
  remove: (id: string, token: string) =>
    apiClient.delete(`/recurring-transactions/${id}`, withAuth(token)),
};
