// Largest value a NUMERIC(12,2) money column can hold.
export const MAX_MONEY_AMOUNT = 9_999_999_999.99;

// Money is summed in integer cents: adding two-decimal floats directly
// drifts (0.1 + 0.2 !== 0.3) and the drift shows up in reports.
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}
