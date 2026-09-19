import { EMPTY_FINANCE_DATA, type FinanceData } from "../types";

function storageKey(email: string): string {
  return `tally.finance.${email}`;
}

export function loadFinanceData(email: string): FinanceData {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return EMPTY_FINANCE_DATA;
    return { ...EMPTY_FINANCE_DATA, ...(JSON.parse(raw) as Partial<FinanceData>) };
  } catch {
    return EMPTY_FINANCE_DATA;
  }
}

export function saveFinanceData(email: string, data: FinanceData): void {
  localStorage.setItem(storageKey(email), JSON.stringify(data));
}
