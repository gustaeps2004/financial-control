export type CategoryKind = "INCOME" | "FIXED_BILL" | "EXPENSE" | "SAVINGS";

// The order the month is read in: what comes in, what is committed, what
// gets spent, what is put aside.
export const CATEGORY_KINDS: CategoryKind[] = ["INCOME", "FIXED_BILL", "EXPENSE", "SAVINGS"];

export const CATEGORY_KIND_LABELS: Record<CategoryKind, string> = {
  INCOME: "Money in",
  FIXED_BILL: "Fixed bills",
  EXPENSE: "Day-to-day",
  SAVINGS: "Savings",
};

export const CATEGORY_KIND_HINTS: Record<CategoryKind, string> = {
  INCOME: "Salary, freelance work, things you sold",
  FIXED_BILL: "The same bill every month: rent, internet, financing",
  EXPENSE: "Groceries, fuel, eating out",
  SAVINGS: "Money put aside — negative when you take some back",
};

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
