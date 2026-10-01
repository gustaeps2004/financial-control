import type { PaymentMethod } from "@/shared/lib/payment-methods";

export const MAX_INSTALLMENTS = 48;

export interface TransactionInput {
  categoryId: string;
  date: string;
  description: string | null;
  // Negative for refunds, or for money taken back out of savings.
  amount: number;
  paymentMethod: PaymentMethod | null;
  // The card charged — or, for other methods, the account the money left.
  cardId: string | null;
  installments: number;
  // Set when this is the actual value of a recurring transaction's month.
  recurringTransactionId: string | null;
}

export interface TransactionResponse extends TransactionInput {
  id: string;
  createdAt?: string;
}
