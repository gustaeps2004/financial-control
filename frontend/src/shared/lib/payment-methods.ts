import type { Messages } from "@/lib/i18n/messages/en";

export type PaymentMethod = "DEBIT" | "CREDIT" | "PIX" | "CASH" | "BANK_TRANSFER";

export const PAYMENT_METHODS: PaymentMethod[] = ["CREDIT", "PIX", "DEBIT", "CASH", "BANK_TRANSFER"];

export function paymentMethodLabel(method: PaymentMethod | null, t: Messages): string {
  return method ? t.paymentMethods[method] : t.common.notInformed;
}
