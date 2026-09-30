export type PaymentMethod = "DEBIT" | "CREDIT" | "PIX" | "CASH" | "BANK_TRANSFER";

export const PAYMENT_METHODS: PaymentMethod[] = ["CREDIT", "PIX", "DEBIT", "CASH", "BANK_TRANSFER"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT: "Credit card",
  PIX: "Pix",
  DEBIT: "Debit",
  CASH: "Cash",
  BANK_TRANSFER: "Boleto / transfer",
};

export function paymentMethodLabel(method: PaymentMethod | null): string {
  return method ? PAYMENT_METHOD_LABELS[method] : "Not informed";
}
