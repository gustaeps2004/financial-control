import type { Messages } from "@/lib/i18n/messages/en";
import type { Statement, StatementStatus } from "@/features/reports/types";

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

export function statusSentence(statement: Statement, t: Messages): string {
  const sentence = t.statements.sentence;
  switch (statement.status) {
    case "OPEN":
      return sentence.open(statement.closingDate, statement.dueDate);
    case "CLOSED":
      return sentence.closed(statement.closingDate, statement.dueDate);
    case "OVERDUE":
      return sentence.overdue(statement.dueDate);
    case "PAID":
      return sentence.paid;
    case "UPCOMING":
      return sentence.upcoming(statement.closingDate, statement.dueDate);
    case "EMPTY":
      return sentence.empty;
  }
}
