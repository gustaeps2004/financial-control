import { Link } from "react-router-dom";
import { Card, CardKicker } from "@/shared/ui/Card";
import { buttonVariants } from "@/shared/ui/Button";
import { currentYearMonth } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { useRecurringTransactions } from "@/features/recurring/hooks/use-recurring";

export function RecurringSummaryCard() {
  const { recurring } = useRecurringTransactions();
  const thisMonth = currentYearMonth();
  const active = recurring.filter(
    (item) => item.startMonth <= thisMonth && (!item.endMonth || item.endMonth >= thisMonth),
  );

  return (
    <Card className="gap-3 p-4">
      <CardKicker>Recurring</CardKicker>
      <div className="flex flex-col gap-2">
        {active.length === 0 && (
          <p className="m-0 text-[12.5px] text-ink/55">Nothing repeating this month.</p>
        )}
        {active.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 text-[12.5px]">
            <span className="min-w-0 flex-1 truncate">{item.description}</span>
            <span className="text-ink/55">day {item.dayOfMonth}</span>
            <span className="tabular-nums">{formatMoney(item.amount)}</span>
          </div>
        ))}
      </div>
      <Link
        to="/app/recurring"
        className={buttonVariants({ variant: "secondary", className: "self-start" })}
      >
        Manage recurring
      </Link>
    </Card>
  );
}
