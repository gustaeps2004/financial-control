import { Card } from "@/shared/ui/Card";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth } from "@/shared/lib/dates";
import { formatAmount, formatMoney } from "@/shared/lib/money";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Statement, StatementCard } from "@/features/reports/types";
import { STATUS_CLASSES } from "../lib/status";

interface CardYearStripProps {
  card: StatementCard;
  statements: Statement[];
  total: number;
  onOpen: (month: string) => void;
}

export function CardYearStrip({ card, statements, total, onOpen }: CardYearStripProps) {
  const { t } = useI18n();
  const thisMonth = currentYearMonth();
  const largest = Math.max(...statements.map((statement) => statement.total), 1);

  return (
    <Card className="gap-3 p-4">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className="grid h-[21px] w-8 flex-none place-items-center rounded text-[8px] font-semibold"
          style={{ background: card.swatch }}
        >
          {card.mark}
        </span>
        <span className="text-[14px] font-medium">
          {card.nickname}
          {card.deleted && <span className="text-ink/45"> {t.cards.removed}</span>}
        </span>
        <span className="text-[12px] text-ink/50">
          {t.statements.cardDays(card.closingDay, card.dueDay)}
        </span>
        <span className="ml-auto text-[12.5px] text-ink/60 tabular-nums">
          {t.statements.cardYearTotal(formatMoney(total))}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-12">
        {statements.map((statement) => {
          const isThisMonth = statement.month === thisMonth;
          return (
            <button
              key={statement.month}
              type="button"
              onClick={() => onOpen(statement.month)}
              aria-label={t.statements.cell(
                card.nickname,
                statement.month,
                formatMoney(statement.total),
                t.statements.status[statement.status],
              )}
              className={cn(
                "flex min-w-0 cursor-pointer flex-col items-start gap-1 rounded-md border px-2 pt-1.5 pb-2 text-left",
                "hover:border-ink/30 hover:bg-ink/4",
                isThisMonth ? "border-accent/45 bg-accent/6" : "border-transparent bg-track/60",
              )}
            >
              <span
                className={cn(
                  "text-[11px] tracking-[0.04em]",
                  isThisMonth ? "font-semibold text-ink" : "text-neutral-500",
                )}
              >
                {t.dates.monthShort(statement.month)}
              </span>
              <span
                className={cn(
                  "text-[12.5px] whitespace-nowrap tabular-nums",
                  statement.total ? "text-ink" : "text-ink/35",
                )}
              >
                {statement.total ? formatAmount(statement.total) : "—"}
              </span>
              <span className="block h-[3px] w-full rounded-sm bg-ink/6">
                <span
                  className="block h-[3px] rounded-sm bg-accent/70"
                  style={{ width: `${Math.max(0, (statement.total / largest) * 100)}%` }}
                />
              </span>
              {statement.status !== "EMPTY" && (
                <span
                  className={cn(
                    "rounded px-1.5 text-[10px] leading-4 whitespace-nowrap",
                    STATUS_CLASSES[statement.status],
                  )}
                >
                  {t.statements.status[statement.status]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
