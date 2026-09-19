import { useMemo, useState } from "react";
import { Field } from "@/shared/ui/Field";
import { Select } from "@/shared/ui/Select";
import { useFinanceData } from "@/features/finance-data/context/FinanceDataContext";
import { MONTH_NAMES_FULL, formatMoney } from "@/features/finance-data/lib/selectors";
import { QuickAddTransactionForm } from "../components/QuickAddTransactionForm";
import { TransactionsTable } from "../components/TransactionsTable";

export function TransactionsPage() {
  const { cards, categories, transactions, removeTransaction } = useFinanceData();

  const now = new Date();
  const currentYear = now.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(now.getMonth());
  const [filterCat, setFilterCat] = useState("all");

  const years = useMemo(() => {
    const set = new Set(transactions.map((t) => t.year));
    set.add(currentYear);
    return [...set].sort((a, b) => a - b);
  }, [transactions, currentYear]);

  const filtered = useMemo(
    () =>
      transactions
        .filter(
          (t) =>
            t.year === year &&
            (month < 0 || t.month === month) &&
            (filterCat === "all" || t.cat === filterCat),
        )
        .sort((a, b) => b.month - a.month || b.day - a.day),
    [transactions, year, month, filterCat],
  );

  const filteredTotal = filtered
    .filter((t) => t.kind === "out")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div className="mb-4.5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">Transactions</h3>
          <p className="m-0 text-[13px] text-ink/55">
            {filtered.length} entries · {formatMoney(filteredTotal)} out
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Field label="Year" className="w-[118px]">
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Month" className="w-[132px]">
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              <option value={-1}>All year</option>
              {MONTH_NAMES_FULL.map((label, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Category" className="w-[150px]">
            <Select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <QuickAddTransactionForm year={year} month={month} />

      <TransactionsTable
        transactions={filtered}
        cards={cards}
        dateVariant="full"
        onRemove={removeTransaction}
        emptyMessage="No entries match this filter."
      />
    </div>
  );
}
