import { formatAmount, formatMoney } from "@/shared/lib/money";
import type { SummaryView } from "@/features/reports/types";

interface CardStatementsListProps {
  lines: SummaryView["cards"];
}

/**
 * The spreadsheet's credit card table for the period, two lines per card so
 * it fits a narrow column: the statement and what was paid, then how the
 * statement is made up.
 */
export function CardStatementsList({ lines }: CardStatementsListProps) {
  if (lines.length === 0) {
    return <p className="m-0 text-[12.5px] text-ink/55">No cards yet.</p>;
  }

  const total = lines.reduce((sum, line) => sum + line.statementTotal, 0);
  const paid = lines.reduce((sum, line) => sum + line.paid, 0);

  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {lines.map((line) => (
        <li
          key={line.card.id}
          className="flex flex-col gap-0.5 border-b border-divider py-2 first:pt-0 last:border-b-0"
        >
          <div className="flex items-center gap-2 text-[13px]">
            <span
              aria-hidden
              className="inline-block h-3 w-[18px] flex-none rounded-[3px]"
              style={{ background: line.card.swatch }}
            />
            <span className="min-w-0 flex-1 truncate">
              {line.card.nickname}
              {line.card.deleted && <span className="text-ink/45"> (removed)</span>}
            </span>
            <span className="tabular-nums">{formatMoney(line.statementTotal)}</span>
          </div>
          <div className="flex flex-wrap justify-between gap-x-3 pl-[26px] text-[11.5px] text-ink/50">
            <span className="tabular-nums">
              {formatAmount(line.carried)} carried in + {formatAmount(line.newCharges)} new
            </span>
            <span className="tabular-nums">paid {formatMoney(line.paid)}</span>
          </div>
        </li>
      ))}
      <li className="flex justify-between gap-3 pt-2 text-[13px] font-medium">
        <span>Total</span>
        <span className="tabular-nums">
          {formatMoney(total)}
          <span className="ml-2 font-normal text-ink/50">paid {formatMoney(paid)}</span>
        </span>
      </li>
    </ul>
  );
}
