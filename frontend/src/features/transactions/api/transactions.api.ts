import { apiClient, withAuth } from "@/lib/http/api-client";
import type { TransactionInput, TransactionResponse } from "../types";

export const transactionsApi = {
  create: (input: TransactionInput, token: string) =>
    apiClient.post<TransactionResponse, TransactionInput>("/transactions", input, withAuth(token)),
  update: (id: string, input: Partial<TransactionInput>, token: string) =>
    apiClient.patch<TransactionResponse, Partial<TransactionInput>>(
      `/transactions/${id}`,
      input,
      withAuth(token),
    ),
  remove: (id: string, token: string) => apiClient.delete(`/transactions/${id}`, withAuth(token)),
};
