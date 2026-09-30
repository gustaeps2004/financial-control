// What a category means for the month's cash flow. Card bill payments are
// not a category kind: they settle purchases already counted as expenses.
export enum CategoryKind {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  FIXED_BILL = 'FIXED_BILL',
  SAVINGS = 'SAVINGS',
}
