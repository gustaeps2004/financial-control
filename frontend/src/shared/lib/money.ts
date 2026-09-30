export function formatMoney(amount: number): string {
  return (
    "R$ " +
    Math.abs(amount).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Reads what people type for an amount: "1.663,08", "1663,08", "149.91",
 * "R$ 50". A comma is always the decimal separator; without one, a dot
 * followed by one or two final digits is too, and any other dot groups
 * thousands.
 */
export function parseMoneyInput(value: string): number {
  let normalized = value.replace(/[^\d,.-]/g, "");
  if (normalized.includes(",")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (/\.\d{1,2}$/.test(normalized)) {
    normalized = normalized.replace(/\.(?=.*\.)/g, "");
  } else {
    normalized = normalized.replace(/\./g, "");
  }
  return parseFloat(normalized) || 0;
}

/** "− R$ 10,00" or "+ R$ 10,00"; zero has no sign. */
export function formatSignedMoney(amount: number): string {
  if (amount === 0) return formatMoney(0);
  return `${amount < 0 ? "−" : "+"} ${formatMoney(amount)}`;
}

/** A ratio as a whole percentage: 0.8206 → "82%". */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
