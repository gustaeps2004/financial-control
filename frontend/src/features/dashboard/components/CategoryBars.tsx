import { formatMoney, formatPercent } from "@/shared/lib/money";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { SplitCategoryLine } from "@/features/reports/types";

interface CategoryBarsProps {
  lines: SplitCategoryLine[];
  emptyMessage: string;
}

/**
 * Day-to-day spending per category. One series, so every bar wears the same
 * accent (shading bars by size would spend color re-encoding their length).
 */
export function CategoryBars({ lines, emptyMessage }: CategoryBarsProps) {
  const { t } = useI18n();

  if (lines.length === 0) {
    return <p className="m-0 text-[12.5px] text-ink/55">{emptyMessage}</p>;
  }

  const largest = Math.max(...lines.map((line) => line.total), 1);

  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {lines.map((line) => (
        <li key={line.category.id} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate">{line.category.name}</span>
            <span className="tabular-nums">{formatMoney(line.total)}</span>
          </div>
          <span className="block h-1.5 rounded-sm bg-track">
            <span
              className="block h-1.5 rounded-sm bg-accent"
              style={{ width: `${Math.max(0, (line.total / largest) * 100)}%` }}
            />
          </span>
          <span className="text-[11.5px] text-ink/50">
            {line.credit > 0 && line.cash > 0
              ? t.dashboard.categorySplit.both(formatMoney(line.cash), formatMoney(line.credit))
              : line.credit > 0
                ? t.dashboard.categorySplit.allOnCards
                : t.dashboard.categorySplit.allPaidNow}
            {line.share > 0 && ` · ${t.dashboard.shareOfIncome(formatPercent(line.share))}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
