import { formatDate } from "@/shared/lib/dates";
import type { Statement, StatementStatus } from "@/features/reports/types";

export const STATUS_LABELS: Record<StatementStatus, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  OVERDUE: "Overdue",
  PAID: "Paid",
  UPCOMING: "Upcoming",
  EMPTY: "Nothing on it",
};

// Purple marks what needs attention now, red what is late; everything
// settled or still far away stays quiet.
export const STATUS_CLASSES: Record<StatementStatus, string> = {
  OPEN: "border border-accent/70 text-accent",
  CLOSED: "bg-accent-800 text-accent-100",
  OVERDUE: "bg-danger/20 text-danger",
  PAID: "bg-neutral-800 text-neutral-300",
  UPCOMING: "text-ink/50",
  EMPTY: "text-ink/35",
};

export function statusSentence(statement: Statement): string {
  const due = statement.dueDate ? `due ${formatDate(statement.dueDate)}` : null;
  switch (statement.status) {
    case "OPEN":
      return `Taking purchases until ${formatDate(statement.closingDate)}${due ? `, ${due}` : ""}.`;
    case "CLOSED":
      return `Closed on ${formatDate(statement.closingDate)}${due ? `, ${due}` : ""}.`;
    case "OVERDUE":
      return `Past the due date${statement.dueDate ? ` (${formatDate(statement.dueDate)})` : ""} and not fully paid.`;
    case "PAID":
      return "Paid.";
    case "UPCOMING":
      return `Closes on ${formatDate(statement.closingDate)}${due ? `, ${due}` : ""}. New purchases start landing on it once the current statement closes.`;
    case "EMPTY":
      return "Nothing lands on this statement.";
  }
}
