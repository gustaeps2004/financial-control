import { addMonths, yearMonthOf } from "@/shared/lib/dates";
import type { CardAccount } from "../types";

/**
 * The statement a purchase lands on — the same rule the API applies (see
 * Card.statementMonthFor there): up to the closing day it closes that month,
 * later it rolls to the next closing, and statements are named after the
 * month they are due in.
 */
export function statementMonthFor(
  card: Pick<CardAccount, "closeDay" | "dueDay">,
  purchaseDate: string,
): string | null {
  const closingDay = parseInt(card.closeDay, 10);
  if (Number.isNaN(closingDay) || !/^\d{4}-\d{2}-\d{2}$/.test(purchaseDate)) return null;

  const dueDay = parseInt(card.dueDay, 10);
  const purchaseMonth = yearMonthOf(purchaseDate);
  const closingMonth =
    Number(purchaseDate.slice(8, 10)) <= closingDay ? purchaseMonth : addMonths(purchaseMonth, 1);
  const dueOffset = !Number.isNaN(dueDay) && dueDay <= closingDay ? 1 : 0;
  return addMonths(closingMonth, dueOffset);
}
