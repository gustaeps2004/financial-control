import { apiClient, withAuth } from "@/lib/http/api-client";

export interface StatementAdjustmentResponse {
  id: string;
  cardId: string;
  statementMonth: string;
  amount: number;
}

export interface StatementPaymentResponse {
  id: string;
  cardId: string;
  statementMonth: string;
  paidOn: string;
  amount: number;
}

export const cardStatementsApi = {
  setAdjustment: (cardId: string, month: string, amount: number, token: string) =>
    apiClient.put<StatementAdjustmentResponse, { amount: number }>(
      `/card-statements/${cardId}/${month}/adjustment`,
      { amount },
      withAuth(token),
    ),
  removeAdjustment: (cardId: string, month: string, token: string) =>
    apiClient.delete(`/card-statements/${cardId}/${month}/adjustment`, withAuth(token)),
  registerPayment: (
    cardId: string,
    month: string,
    payment: { paidOn: string; amount: number },
    token: string,
  ) =>
    apiClient.post<StatementPaymentResponse, { paidOn: string; amount: number }>(
      `/card-statements/${cardId}/${month}/payments`,
      payment,
      withAuth(token),
    ),
  removePayment: (paymentId: string, token: string) =>
    apiClient.delete(`/card-statements/payments/${paymentId}`, withAuth(token)),
};
