import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { addMonths, currentYearMonth, formatYearMonth } from "@/shared/lib/dates";

interface MonthSwitcherProps {
  month: string; // YYYY-MM
  onChange: (month: string) => void;
}

const arrowClasses =
  "grid size-8 cursor-pointer place-items-center rounded-md border border-divider bg-transparent text-neutral-400 hover:bg-ink/7 hover:text-ink";

export function MonthSwitcher({ month, onChange }: MonthSwitcherProps) {
  const thisMonth = currentYearMonth();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Previous month"
        className={arrowClasses}
        onClick={() => onChange(addMonths(month, -1))}
      >
        <CaretLeft size={14} />
      </button>
      <span
        aria-live="polite"
        className="min-w-[136px] text-center text-[13.5px] font-medium tabular-nums"
      >
        {formatYearMonth(month)}
      </span>
      <button
        type="button"
        aria-label="Next month"
        className={arrowClasses}
        onClick={() => onChange(addMonths(month, 1))}
      >
        <CaretRight size={14} />
      </button>
      {month !== thisMonth && (
        <button
          type="button"
          onClick={() => onChange(thisMonth)}
          className="ml-1 cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-[12px] text-accent hover:bg-accent/10"
        >
          This month
        </button>
      )}
    </div>
  );
}
