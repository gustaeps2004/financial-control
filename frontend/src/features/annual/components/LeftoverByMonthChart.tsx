import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatMoneyWithMinus } from "@/shared/lib/money";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { AnnualView } from "@/features/reports/types";

interface LeftoverByMonthChartProps {
  annual: AnnualView;
}

/**
 * What was left each month, above or below zero (a diverging form: the
 * accent above, the danger red below, zero as the neutral baseline).
 * Projected months are outlines, so "projection" never rests on color.
 */
export function LeftoverByMonthChart({ annual }: LeftoverByMonthChartProps) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState<string | null>(null);
  const values = annual.months.map((month) => month.cashFlow.leftover);
  const top = Math.max(0, ...values);
  const bottom = Math.min(0, ...values);
  const range = top - bottom || 1;
  // Leave headroom on both sides for the value label.
  const scale = (value: number) => (value / range) * 80;
  const zero = 10 + scale(-bottom);

  return (
    <div>
      <div className="relative h-[168px]">
        <span
          aria-hidden
          className="absolute right-0 left-0 h-px bg-divider"
          style={{ bottom: `${zero}%` }}
        />
        <div className="absolute inset-0 flex gap-1">
          {annual.months.map(({ month, status, cashFlow }) => {
            const value = cashFlow.leftover;
            const isProjected = status === "PROJECTED";
            const isNegative = value < 0;
            const height = Math.abs(scale(value));
            const label = t.annual.chart.bar(month, formatMoneyWithMinus(value), isProjected);
            return (
              <div
                key={month}
                tabIndex={0}
                role="img"
                aria-label={label}
                onPointerEnter={() => setHovered(month)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(month)}
                onBlur={() => setHovered(null)}
                className="relative flex min-w-0 flex-1 justify-center rounded-md outline-none hover:bg-ink/4 focus-visible:bg-ink/4"
              >
                {value !== 0 && (
                  <span
                    className={cn(
                      "absolute w-full max-w-6",
                      isNegative ? "rounded-b-[4px]" : "rounded-t-[4px]",
                      isProjected && "border bg-transparent",
                      isProjected && (isNegative ? "border-t-0 border-danger" : "border-b-0 border-accent"),
                      !isProjected && (isNegative ? "bg-danger" : "bg-accent"),
                    )}
                    style={{
                      bottom: `${isNegative ? zero - height : zero}%`,
                      height: `max(2px, ${height}%)`,
                    }}
                  />
                )}
                {hovered === month && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute z-10 rounded-md bg-canvas px-2.5 py-1.5 text-[12px] whitespace-nowrap shadow-[var(--shadow-elev-md)]"
                    // Anchored on the zero line, on the side where this month
                    // has no bar, so it never covers the mark it describes.
                    style={
                      isNegative
                        ? { bottom: `calc(${zero}% + 6px)` }
                        : { top: `calc(${100 - zero}% + 6px)` }
                    }
                  >
                    <b className="block font-semibold tabular-nums">{formatMoneyWithMinus(value)}</b>
                    <span className="text-ink/60">{t.annual.chart.tooltip(month, isProjected)}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-1.5 flex gap-1">
        {annual.months.map(({ month }) => (
          <span
            key={month}
            className={cn(
              "min-w-0 flex-1 text-center text-[11px] tracking-[0.04em]",
              month === annual.currentMonth ? "font-semibold text-ink" : "text-neutral-500",
            )}
          >
            {t.dates.monthShort(month)}
          </span>
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-ink/60">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-accent" />
          {t.annual.chart.moneyLeft}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm bg-danger" />
          {t.annual.chart.overspent}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block size-2.5 rounded-sm border border-neutral-500" />
          {t.common.projection}
        </span>
      </div>
    </div>
  );
}
