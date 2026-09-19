import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { buttonVariants } from "@/shared/ui/Button";
import { useFinanceData } from "@/features/finance-data/context/FinanceDataContext";
import {
  MONTH_NAMES_FULL,
  categoryTotals,
  monthlySpendSeries,
  sumByKind,
  transactionsInMonth,
} from "@/features/finance-data/lib/selectors";
import { QuickAddTransactionForm } from "@/features/transactions/components/QuickAddTransactionForm";
import { TransactionsTable } from "@/features/transactions/components/TransactionsTable";
import { MonthChart } from "../components/MonthChart";
import { NetSummaryCard } from "../components/NetSummaryCard";
import { CategoryBreakdownCard } from "../components/CategoryBreakdownCard";
import { CardsBalanceCard } from "../components/CardsBalanceCard";

export function DashboardPage() {
  const { cards, transactions } = useFinanceData();

  const now = new Date();
  const currentYear = now.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(now.getMonth());

  const years = useMemo(() => {
    const set = new Set(transactions.map((t) => t.year));
    set.add(currentYear);
    return [...set].sort((a, b) => a - b);
  }, [transactions, currentYear]);

  const monthTransactions = useMemo(
    () => transactionsInMonth(transactions, year, month),
    [transactions, year, month],
  );
  const income = sumByKind(monthTransactions, "in");
  const expense = sumByKind(monthTransactions, "out");
  const catTotals = categoryTotals(monthTransactions);
  const monthlySpend = useMemo(() => monthlySpendSeries(transactions, year), [transactions, year]);

  const recent = [...monthTransactions].sort((a, b) => b.day - a.day).slice(0, 7);

  return (
    <div>
      <div className="mb-4.5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">
            {MONTH_NAMES_FULL[month]} {year}
          </h3>
          <p className="m-0 text-[13px] text-ink/55">
            {monthTransactions.length} entries recorded
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => setYear(y)}
              className={cn(
                "cursor-pointer rounded-md border px-2.5 py-1.5 text-[12px] font-medium",
                y === year ? "border-accent text-accent" : "border-ink/16 text-neutral-500",
              )}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <MonthChart month={month} monthlySpend={monthlySpend} onMonthChange={setMonth} />

      <QuickAddTransactionForm year={year} month={month} compact />

      <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
        <NetSummaryCard income={income} expense={expense} />
        <CategoryBreakdownCard totals={catTotals} />
        <CardsBalanceCard cards={cards} monthTransactions={monthTransactions} />
      </div>

      <div className="mt-6.5 mb-1.5 flex items-baseline justify-between">
        <h5 className="m-0">Recent</h5>
        <Link to="/app/transactions" className={buttonVariants({ variant: "ghost" })}>
          See all
        </Link>
      </div>
      <TransactionsTable
        transactions={recent}
        cards={cards}
        dateVariant="day"
        emptyMessage={`Nothing logged in ${MONTH_NAMES_FULL[month]} yet. Use quick entry above.`}
      />
    </div>
  );
}
