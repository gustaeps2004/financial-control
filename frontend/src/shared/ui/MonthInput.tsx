import { MONTH_NAMES, currentYearMonth, parseYearMonth } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/cn";

interface MonthInputProps {
  id?: string;
  label: string;
  value: string; // YYYY-MM, or "" when empty
  onChange: (value: string) => void;
  // Offers an empty choice, shown with this label (e.g. "No end").
  emptyLabel?: string;
  className?: string;
}

const selectClasses =
  "min-h-9 rounded-md border border-divider bg-surface px-2 py-1.5 text-[14px] text-ink hover:border-ink/45 focus-visible:border-accent focus-visible:outline-none";

/**
 * Month + year as two selects: <input type="month"> is not available in
 * every browser (Firefox renders a plain text box).
 */
export function MonthInput({ id, label, value, onChange, emptyLabel, className }: MonthInputProps) {
  const fallback = parseYearMonth(currentYearMonth());
  const parsed = value ? parseYearMonth(value) : null;
  const year = parsed?.year ?? fallback.year;
  const years = Array.from({ length: 16 }, (_, index) => fallback.year - 5 + index);
  if (!years.includes(year)) years.unshift(year);

  return (
    <div role="group" aria-label={label} className={cn("flex gap-1.5", className)}>
      <select
        id={id}
        aria-label={`${label}: month`}
        className={cn(selectClasses, "min-w-0 flex-1")}
        value={parsed ? String(parsed.month) : ""}
        onChange={(e) => {
          const month = Number(e.target.value);
          onChange(month ? `${year}-${String(month).padStart(2, "0")}` : "");
        }}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {MONTH_NAMES.map((name, index) => (
          <option key={name} value={String(index + 1)}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={`${label}: year`}
        className={cn(selectClasses, "w-[88px] flex-none")}
        value={String(year)}
        disabled={!parsed}
        onChange={(e) =>
          parsed && onChange(`${e.target.value}-${String(parsed.month).padStart(2, "0")}`)
        }
      >
        {years.map((option) => (
          <option key={option} value={String(option)}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
