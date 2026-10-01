export type CategoryKind = "INCOME" | "FIXED_BILL" | "EXPENSE" | "SAVINGS";

// The order the month is read in: what comes in, what is committed, what
// gets spent, what is put aside.
export const CATEGORY_KINDS: CategoryKind[] = ["INCOME", "FIXED_BILL", "EXPENSE", "SAVINGS"];

/** Only spending can be charged to a credit card. */
export function acceptsCreditCard(kind: CategoryKind): boolean {
  return kind === "EXPENSE" || kind === "FIXED_BILL";
}

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  createdAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  kind: CategoryKind;
}

export interface UpdateCategoryRequest {
  name?: string;
  kind?: CategoryKind;
}
