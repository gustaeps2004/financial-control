import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface YearSwitcherProps {
  year: number;
  onChange: (year: number) => void;
}

const arrowClasses =
  "grid size-8 cursor-pointer place-items-center rounded-md border border-divider bg-transparent text-neutral-400 hover:bg-ink/7 hover:text-ink";

export function YearSwitcher({ year, onChange }: YearSwitcherProps) {
  const thisYear = new Date().getFullYear();

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Previous year"
        className={arrowClasses}
        onClick={() => onChange(year - 1)}
      >
        <CaretLeft size={14} />
      </button>
      <span aria-live="polite" className="min-w-[56px] text-center text-[13.5px] font-medium tabular-nums">
        {year}
      </span>
      <button
        type="button"
        aria-label="Next year"
        className={arrowClasses}
        onClick={() => onChange(year + 1)}
      >
        <CaretRight size={14} />
      </button>
      {year !== thisYear && (
        <button
          type="button"
          onClick={() => onChange(thisYear)}
          className="ml-1 cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-[12px] text-accent hover:bg-accent/10"
        >
          This year
        </button>
      )}
    </div>
  );
}
