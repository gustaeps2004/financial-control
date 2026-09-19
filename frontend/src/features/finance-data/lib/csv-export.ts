import { formatDateShort, methodLabel } from "./selectors";
import type { CardAccount, Transaction } from "../types";

function escapeCsvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function transactionsToCsv(transactions: Transaction[], cards: CardAccount[]): string {
  const header = ["Date", "Description", "Category", "Method", "Amount", "Type"];
  const rows = transactions
    .slice()
    .sort((a, b) => a.year - b.year || a.month - b.month || a.day - b.day)
    .map((t) => [
      `${t.year}-${formatDateShort(t.day, t.month).split("/").reverse().join("-")}`,
      t.desc,
      t.cat,
      methodLabel(t, cards),
      t.amount.toFixed(2),
      t.kind === "in" ? "Income" : "Expense",
    ]);

  return [header, ...rows].map((row) => row.map(escapeCsvField).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
