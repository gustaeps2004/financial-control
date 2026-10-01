import type { PaymentMethod } from "@/shared/lib/payment-methods";

export interface RecurringTransactionInput {
  categoryId: string;
  description: string;
  amount: number;
  dayOfMonth: number;
  startMonth: string; // YYYY-MM
  // null keeps it repeating with no end ("Vigente até" left empty).
  endMonth: string | null;
  paymentMethod: PaymentMethod | null;
  cardId: string | null;
}

export interface RecurringTransaction extends RecurringTransactionInput {
  id: string;
  createdAt?: string;
}
