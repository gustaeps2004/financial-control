import { cn } from "@/shared/lib/cn";
import { MONTH_LABELS } from "@/features/finance-data/lib/selectors";

interface MonthChartProps {
  month: number;
  monthlySpend: number[];
  onMonthChange: (month: number) => void;
}

export function MonthChart({ month, monthlySpend, onMonthChange }: MonthChartProps) {
  const maxSpend = Math.max(...monthlySpend, 1);

  return (
    <div
      className="mb-6 flex items-end gap-1 rounded-md pt-3 pr-1 pl-1"
      style={{ background: "linear-gradient(180deg, rgba(233,233,237,.03), transparent)" }}
    >
      {MONTH_LABELS.map((label, index) => {
        const active = month === index;
        const height = Math.max(4, Math.round((monthlySpend[index]! / maxSpend) * 52));
        return (
          <button
            key={label}
            type="button"
            onClick={() => onMonthChange(index)}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-md pb-1"
          >
            <span
              className={cn(
                "w-full max-w-[26px] rounded-t-sm",
                active ? "bg-accent" : monthlySpend[index] ? "bg-neutral-800" : "bg-track",
              )}
              style={{ height: `${height}px` }}
            />
            <span
              className={cn(
                "text-[11px] font-medium tracking-[0.04em]",
                active ? "text-ink" : "text-neutral-600",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
