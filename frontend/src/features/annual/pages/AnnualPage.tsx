import { useState } from "react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { YearSwitcher } from "@/shared/ui/YearSwitcher";
import { cn } from "@/shared/lib/cn";
import { formatYearMonth } from "@/shared/lib/dates";
import { formatMoneyWithMinus } from "@/shared/lib/money";
import { useAnnual } from "@/features/reports/hooks/use-reports";
import type { CashFlow } from "@/features/reports/types";
import { LeftoverByMonthChart } from "../components/LeftoverByMonthChart";

// The spreadsheet's "Visão Anual" columns, plus what was left.
const COLUMNS: Array<{ key: keyof CashFlow; label: string }> = [
  { key: "income", label: "Money in" },
  { key: "fixedBills", label: "Fixed bills" },
  { key: "cardBills", label: "Card bills" },
  { key: "cashExpenses", label: "Paid now" },
  { key: "creditPurchases", label: "On cards" },
  { key: "savings", label: "Savings" },
  { key: "totalOut", label: "Total out" },
  { key: "leftover", label: "Left over" },
];

function Amount({ value, strong }: { value: number; strong?: boolean }) {
  return (
    <span className={cn(value === 0 && "text-ink/35", strong && "font-medium")}>
      {value === 0 ? "—" : formatMoneyWithMinus(value)}
    </span>
  );
}

export function AnnualPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const annual = useAnnual(year);
  const data = annual.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">Year overview</h3>
          <p className="m-0 max-w-[620px] text-[13px] text-ink/55 text-pretty">
            Month by month. Months still to come are projections: recurring items post
            themselves and card bills count at their statements' value.
          </p>
        </div>
        <YearSwitcher year={year} onChange={setYear} />
      </div>

      {annual.error && (
        <p className="m-0 text-[12.5px] text-accent-300">{annual.error.message}</p>
      )}

      {data && (
        <div className={cn("flex flex-col gap-4 transition-opacity", annual.isLoading && "opacity-60")}>
          <Card className="gap-3 p-4">
            <CardKicker>Left over, month by month</CardKicker>
            <LeftoverByMonthChart annual={data} />
          </Card>

          <Card className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <Th>Month</Th>
                  {COLUMNS.map((column) => (
                    <Th key={column.key} className="text-right whitespace-nowrap">
                      {column.label}
                    </Th>
                  ))}
                </TableHead>
                <TableBody>
                  {data.months.map(({ month, status, cashFlow }) => (
                    <TableRow key={month} className={cn(status === "PROJECTED" && "opacity-70")}>
                      <Td className="whitespace-nowrap">
                        {formatYearMonth(month)}
                        {status === "PROJECTED" && (
                          <span className="ml-2 rounded border border-accent/50 px-1.5 text-[10px] leading-4 text-accent">
                            Projection
                          </span>
                        )}
                      </Td>
                      {COLUMNS.map((column) => (
                        <Td key={column.key} className="text-right text-[13px] whitespace-nowrap tabular-nums">
                          <Amount value={cashFlow[column.key]} strong={column.key === "leftover"} />
                        </Td>
                      ))}
                    </TableRow>
                  ))}
                  {[
                    { label: "Happened so far", totals: data.realized },
                    { label: "Whole year, with projections", totals: data.withProjection },
                  ].map((row) => (
                    <TableRow key={row.label} className="bg-ink/3">
                      <Td className="text-[13px] font-medium whitespace-nowrap">{row.label}</Td>
                      {COLUMNS.map((column) => (
                        <Td key={column.key} className="text-right text-[13px] whitespace-nowrap tabular-nums">
                          <Amount value={row.totals[column.key]} strong />
                        </Td>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          <p className="m-0 text-[12px] text-ink/50">
            Total out = fixed bills + card bills + paid now. "On cards" is what was charged
            to cards that month — it leaves the account later, inside the card bills.
          </p>
        </div>
      )}
    </div>
  );
}
