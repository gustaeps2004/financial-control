import { cn } from "@/shared/lib/cn";
import { MonthSwitcher } from "@/shared/ui/MonthSwitcher";
import { YearSwitcher } from "@/shared/ui/YearSwitcher";
import { parseYearMonth, toYearMonth } from "@/shared/lib/dates";
import { useI18n } from "@/lib/i18n/i18n-context";

export type PeriodMode = "MONTH" | "YEAR" | "ALL";

interface PeriodControlsProps {
  mode: PeriodMode;
  month: string;
  onModeChange: (mode: PeriodMode) => void;
  onMonthChange: (month: string) => void;
}

const MODES: PeriodMode[] = ["MONTH", "YEAR", "ALL"];

/** One row of filters scoping everything below it. */
export function PeriodControls({ mode, month, onModeChange, onMonthChange }: PeriodControlsProps) {
  const { t } = useI18n();
  const { year, month: monthNumber } = parseYearMonth(month);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="group"
        aria-label={t.dashboard.period}
        className="flex rounded-md border border-divider p-0.5"
      >
        {MODES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={mode === option}
            onClick={() => onModeChange(option)}
            className={cn(
              "cursor-pointer rounded-[6px] border-0 px-2.5 py-1 text-[12.5px] font-medium",
              mode === option ? "bg-accent/16 text-ink" : "bg-transparent text-neutral-500 hover:text-ink",
            )}
          >
            {t.dashboard.periodModes[option]}
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
