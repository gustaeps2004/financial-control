import { CheckCircle, Circle } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";

interface PaidToggleProps {
  paid: boolean;
  // The bill's name: screen readers hear which bill each toggle is for.
  name: string;
  saving?: boolean;
  onChange: (paid: boolean) => void;
}

/**
 * Whether a month's bill was paid, ticked off by hand. Like the statements,
 * what still needs attention is purple and what is settled stays quiet.
 */
export function PaidToggle({ paid, name, saving = false, onChange }: PaidToggleProps) {
  const { t } = useI18n();
  const labels = t.recurring.paid;

  return (
    // Relative, so the visually hidden parts stay inside the table's scroll box
    // instead of widening the page on narrow screens.
    <label
      title={paid ? labels.markUnpaid : labels.markPaid}
      className={cn("relative inline-flex", saving ? "cursor-wait opacity-60" : "cursor-pointer")}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={paid}
        disabled={saving}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-px text-[11.5px] leading-[18px] whitespace-nowrap",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          paid
            ? "border-transparent bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            : "border-accent/70 text-accent hover:bg-accent/10",
        )}
      >
        {paid ? <CheckCircle size={13} weight="fill" /> : <Circle size={13} />}
        <span className="sr-only">{name}:</span>
        {/* Both words share one cell, so the pill keeps its width when toggled. */}
        <span className="grid">
          <span className={cn("col-start-1 row-start-1", !paid && "invisible")}>{labels.paid}</span>
          <span className={cn("col-start-1 row-start-1", paid && "invisible")}>{labels.unpaid}</span>
        </span>
      </span>
    </label>
  );
}
