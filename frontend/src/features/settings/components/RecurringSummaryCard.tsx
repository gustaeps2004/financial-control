import { Link } from "react-router-dom";
import { Card, CardKicker } from "@/shared/ui/Card";
import { buttonVariants } from "@/shared/ui/Button";
import { useFinanceData } from "@/features/finance-data/context/FinanceDataContext";
import { formatMoney } from "@/features/finance-data/lib/selectors";

export function RecurringSummaryCard() {
  const { recurring, removeRecurring } = useFinanceData();

  return (
    <Card className="gap-3 p-4">
      <CardKicker>Recurring</CardKicker>
      <div className="flex flex-col gap-2">
        {recurring.length === 0 && (
          <p className="m-0 text-[12.5px] text-ink/55">Nothing set up yet.</p>
        )}
        {recurring.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 text-[12.5px]">
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            <span className="text-ink/55">day {item.day}</span>
            <span className="tabular-nums">{formatMoney(item.amount)}</span>
            <button
              type="button"
              onClick={() => removeRecurring(item.id)}
              className="cursor-pointer border-0 bg-transparent text-accent"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <Link
        to="/setup/recurring"
        className={buttonVariants({ variant: "secondary", className: "self-start" })}
      >
        Edit recurring
      </Link>
    </Card>
  );
}
