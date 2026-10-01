import { cn } from "@/shared/lib/cn";
import { MonthSwitcher } from "@/shared/ui/MonthSwitcher";
import { YearSwitcher } from "@/shared/ui/YearSwitcher";
import { parseYearMonth, toYearMonth } from "@/shared/lib/dates";

export type PeriodMode = "MONTH" | "YEAR" | "ALL";

interface PeriodControlsProps {
  mode: PeriodMode;
  month: string;
  onModeChange: (mode: PeriodMode) => void;
  onMonthChange: (month: string) => void;
}

const MODES: Array<{ mode: PeriodMode; label: string }> = [
  { mode: "MONTH", label: "Month" },
  { mode: "YEAR", label: "Year" },
  { mode: "ALL", label: "All time" },
];

/** One row of filters scoping everything below it. */
export function PeriodControls({ mode, month, onModeChange, onMonthChange }: PeriodControlsProps) {
  const { year, month: monthNumber } = parseYearMonth(month);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label="Period" className="flex rounded-md border border-divider p-0.5">
        {MODES.map((option) => (
          <button
            key={option.mode}
            type="button"
            aria-pressed={mode === option.mode}
            onClick={() => onModeChange(option.mode)}
            className={cn(
              "cursor-pointer rounded-[6px] border-0 px-2.5 py-1 text-[12.5px] font-medium",
              mode === option.mode ? "bg-accent/16 text-ink" : "bg-transparent text-neutral-500 hover:text-ink",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {mode === "MONTH" && <MonthSwitcher month={month} onChange={onMonthChange} />}
      {mode === "YEAR" && (
        <YearSwitcher year={year} onChange={(next) => onMonthChange(toYearMonth(next, monthNumber))} />
      )}
    </div>
  );
}
