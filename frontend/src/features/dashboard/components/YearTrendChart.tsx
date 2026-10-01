import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatYearMonth } from "@/shared/lib/dates";
import { formatAmount, formatMoney } from "@/shared/lib/money";
import type { AnnualView } from "@/features/reports/types";

interface YearTrendChartProps {
  annual: AnnualView;
  selectedMonth: string | null;
  onSelect: (month: string) => void;
}

/**
 * What left the account each month of the year. The selected month is the
 * one in the accent (emphasis form); months still to come are projections,
 * drawn as outlines so the difference never rests on color alone.
 */
export function YearTrendChart({ annual, selectedMonth, onSelect }: YearTrendChartProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const largest = Math.max(...annual.months.map((month) => month.cashFlow.totalOut), 1);

  return (
    <div>
      <div className="relative flex h-[120px] items-end gap-1 border-b border-divider">
        {annual.months.map(({ month, status, cashFlow }) => {
          const isSelected = month === selectedMonth;
          const isProjected = status === "PROJECTED";
          // Capped below 100% so the value label always fits above the bar.
          const height = Math.max(0, (cashFlow.totalOut / largest) * 82);
          const showValue = isSelected || hovered === month;
          return (
            <button
              key={month}
              type="button"
              onClick={() => onSelect(month)}
              onPointerEnter={() => setHovered(month)}
              onPointerLeave={() => setHovered(null)}
              onFocus={() => setHovered(month)}
              onBlur={() => setHovered(null)}
              aria-pressed={isSelected}
              aria-label={`${formatYearMonth(month)}: ${formatMoney(cashFlow.totalOut)} out${isProjected ? ", projected" : ""}`}
              className="relative flex h-full min-w-0 flex-1 cursor-pointer items-end justify-center rounded-t-md border-0 bg-transparent p-0 hover:bg-ink/4"
            >
              {showValue && cashFlow.totalOut > 0 && (
                <span
                  className="pointer-events-none absolute z-10 text-[11px] whitespace-nowrap text-ink tabular-nums"
                  style={{ bottom: `calc(${height}% + 4px)` }}
                >
                  {formatAmount(cashFlow.totalOut)}
                </span>
              )}
              {cashFlow.totalOut > 0 && (
                <span
                  className={cn(
                    "block w-full max-w-6 rounded-t-[4px]",
                    isProjected && "border border-b-0 bg-transparent",
                    isProjected && (isSelected ? "border-accent" : "border-neutral-600"),
                    !isProjected && (isSelected ? "bg-accent" : "bg-neutral-600"),
                  )}
                  style={{ height: `${height}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-1.5 flex gap-1">
        {annual.months.map(({ month }) => (
          <span
            key={month}
            className={cn(
              "min-w-0 flex-1 text-center text-[11px] tracking-[0.04em]",
              month === selectedMonth ? "font-semibold text-ink" : "text-neutral-500",
            )}
          >
            {formatYearMonth(month, "short")}
          </span>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink/60">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-neutral-600" />
          Happened
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm border border-neutral-600" />
          Projection
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-accent" />
          Selected month
        </span>
      </div>
    </div>
  );
}
