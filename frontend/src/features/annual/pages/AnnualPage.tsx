import { useState } from "react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { YearSwitcher } from "@/shared/ui/YearSwitcher";
import { cn } from "@/shared/lib/cn";
import { formatMoneyWithMinus } from "@/shared/lib/money";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAnnual } from "@/features/reports/hooks/use-reports";
import type { CashFlow } from "@/features/reports/types";
import { LeftoverByMonthChart } from "../components/LeftoverByMonthChart";

// The spreadsheet's "Visão Anual" columns, plus what was left.
const COLUMNS: Array<keyof CashFlow> = [
  "income",
  "fixedBills",
  "cardBills",
  "cashExpenses",
  "creditPurchases",
  "savings",
  "totalOut",
  "leftover",
];

function Amount({ value, strong }: { value: number; strong?: boolean }) {
  return (
    <span className={cn(value === 0 && "text-ink/35", strong && "font-medium")}>
      {value === 0 ? "—" : formatMoneyWithMinus(value)}
    </span>
  );
}

export function AnnualPage() {
  const { t } = useI18n();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const annual = useAnnual(year);
  const data = annual.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">{t.annual.title}</h3>
          <p className="m-0 max-w-[620px] text-[13px] text-ink/55 text-pretty">{t.annual.intro}</p>
        </div>
        <YearSwitcher year={year} onChange={setYear} />
      </div>

      {annual.error && (
        <p className="m-0 text-[12.5px] text-accent-300">
          {errorMessage(annual.error, t, t.annual.loadFailed)}
        </p>
      )}

      {data && (
        <div className={cn("flex flex-col gap-4 transition-opacity", annual.isLoading && "opacity-60")}>
          <Card className="gap-3 p-4">
            <CardKicker>{t.annual.leftoverByMonth}</CardKicker>
            <LeftoverByMonthChart annual={data} />
          </Card>

          <Card className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <Th>{t.fields.month}</Th>
                  {COLUMNS.map((column) => (
                    <Th key={column} className="text-right whitespace-nowrap">
                      {t.cashFlow[column]}
                    </Th>
                  ))}
                </TableHead>
                <TableBody>
                  {data.months.map(({ month, status, cashFlow }) => (
                    <TableRow key={month} className={cn(status === "PROJECTED" && "opacity-70")}>
                      <Td className="whitespace-nowrap">
                        {t.dates.yearMonth(month)}
                        {status === "PROJECTED" && (
                          <span className="ml-2 rounded border border-accent/50 px-1.5 text-[10px] leading-4 text-accent">
                            {t.common.projection}
                          </span>
                        )}
                      </Td>
                      {COLUMNS.map((column) => (
                        <Td key={column} className="text-right text-[13px] whitespace-nowrap tabular-nums">
                          <Amount value={cashFlow[column]} strong={column === "leftover"} />
                        </Td>
                      ))}
                    </TableRow>
                  ))}
                  {[
                    { label: t.annual.realized, totals: data.realized },
                    { label: t.annual.withProjection, totals: data.withProjection },
                  ].map((row) => (
                    <TableRow key={row.label} className="bg-ink/3">
                      <Td className="text-[13px] font-medium whitespace-nowrap">{row.label}</Td>
                      {COLUMNS.map((column) => (
                        <Td key={column} className="text-right text-[13px] whitespace-nowrap tabular-nums">
                          <Amount value={row.totals[column]} strong />
                        </Td>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          <p className="m-0 text-[12px] text-ink/50">{t.annual.footnote}</p>
        </div>
      )}
    </div>
  );
}
