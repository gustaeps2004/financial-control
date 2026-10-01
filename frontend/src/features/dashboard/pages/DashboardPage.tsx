import { useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "@phosphor-icons/react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { buttonVariants } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth, formatYearMonth, parseYearMonth } from "@/shared/lib/dates";
import { formatMoney, formatMoneyWithMinus, formatPercent } from "@/shared/lib/money";
import { paymentMethodLabel } from "@/shared/lib/payment-methods";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAnnual, useSummary } from "@/features/reports/hooks/use-reports";
import type { SummaryPeriod, SummaryView } from "@/features/reports/types";
import { BreakdownTable } from "../components/BreakdownTable";
import { CashFlowBridge } from "../components/CashFlowBridge";
import { CardStatementsList } from "../components/CardStatementsList";
import { CategoryBars } from "../components/CategoryBars";
import { PeriodControls, type PeriodMode } from "../components/PeriodControls";
import { StatTile } from "../components/StatTile";
import { YearTrendChart } from "../components/YearTrendChart";

function periodOf(mode: PeriodMode, month: string): SummaryPeriod {
  switch (mode) {
    case "MONTH":
      return { type: "MONTH", month };
    case "YEAR":
      return { type: "YEAR", year: parseYearMonth(month).year };
    case "ALL":
      return { type: "ALL" };
  }
}

function periodTitle(mode: PeriodMode, month: string): string {
  if (mode === "MONTH") return formatYearMonth(month);
  if (mode === "YEAR") return String(parseYearMonth(month).year);
  return "All time";
}

const share = (value: number) => (value > 0 ? formatPercent(value) : "—");

export function DashboardPage() {
  const [mode, setMode] = useState<PeriodMode>("MONTH");
  const [month, setMonth] = useState(currentYearMonth);

  const summary = useSummary(periodOf(mode, month));
  const annual = useAnnual(parseYearMonth(month).year);
  const data = summary.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">{periodTitle(mode, month)}</h3>
          <p className="m-0 text-[13px] text-ink/55">
            {mode === "MONTH"
              ? "Where the month's money came from and where it went."
              : "Only what already happened — projections stay out of these totals."}
          </p>
        </div>
        <PeriodControls
          mode={mode}
          month={month}
          onModeChange={setMode}
          onMonthChange={setMonth}
        />
      </div>

      {data?.projected && (
        <p className="m-0 flex items-start gap-2 rounded-md border border-accent/35 bg-accent/8 px-3 py-2 text-[12.5px] text-ink/85">
          <Info size={16} className="mt-px flex-none text-accent" />
          {formatYearMonth(month)} hasn't happened yet: fixed bills and card statements below
          are projections, and card bills count at their expected value.
        </p>
      )}
      {summary.error && (
        <p className="m-0 text-[12.5px] text-accent-300">
          Couldn't load this period: {summary.error.message}
        </p>
      )}

      {data && (
        <div className={cn("flex flex-col gap-4 transition-opacity", summary.isLoading && "opacity-60")}>
          <OverviewCard data={data} />
          <KpiRow data={data} mode={mode} />

          {annual.data && (
            <Card className="gap-3 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardKicker>{annual.data.year} month by month</CardKicker>
                <span className="text-[11.5px] text-ink/50">
                  Money that left the account · pick a month to see it
                </span>
              </div>
              <YearTrendChart
                annual={annual.data}
                selectedMonth={mode === "MONTH" ? month : null}
                onSelect={(next) => {
                  setMonth(next);
                  setMode("MONTH");
                }}
              />
            </Card>
          )}

          <Breakdowns data={data} />
        </div>
      )}
    </div>
  );
}

function OverviewCard({ data }: { data: SummaryView }) {
  const { cashFlow } = data;
  const isShort = cashFlow.leftover < 0;
  const hasActivity =
    cashFlow.income !== 0 || cashFlow.totalOut !== 0 || cashFlow.savings !== 0;

  return (
    <Card className="gap-5 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[12.5px] text-ink/60">{isShort ? "Short by" : "Left over"}</span>
          {/* The one hero figure of the page; "Short by" already says it's negative. */}
          <span className="text-[40px] leading-none font-semibold tracking-[-0.03em] sm:text-[48px]">
            {formatMoney(cashFlow.leftover)}
          </span>
          <span className="text-[12.5px] text-ink/55">
            {cashFlow.income > 0
              ? `of ${formatMoney(cashFlow.income)} that came in`
              : "Nothing came in during this period."}
          </span>
        </div>
        <Link to="/app/transactions" className={buttonVariants({ variant: "secondary" })}>
          Log a transaction
        </Link>
      </div>
      {hasActivity ? (
        <CashFlowBridge cashFlow={cashFlow} />
      ) : (
        <p className="m-0 text-[13px] text-ink/55">
          Nothing recorded in this period yet. Log transactions or add what repeats every
          month, and this fills itself in.
        </p>
      )}
    </Card>
  );
}

function KpiRow({ data, mode }: { data: SummaryView; mode: PeriodMode }) {
  const { cashFlow } = data;
  const outstanding = data.cards.reduce((sum, line) => sum + line.outstanding, 0);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-3.5",
        mode === "MONTH" ? "lg:grid-cols-4" : "lg:grid-cols-3",
      )}
    >
      <StatTile
        label="Saved"
        value={cashFlow.income > 0 ? formatPercent(cashFlow.savingsRate) : "—"}
        detail={
          cashFlow.savings < 0
            ? `${formatMoney(cashFlow.savings)} taken back out of savings`
            : `${formatMoney(cashFlow.savings)} put aside`
        }
      />
      <StatTile
        label="Committed"
        value={cashFlow.income > 0 ? formatPercent(cashFlow.committedRate) : "—"}
        detail={`${formatMoney(cashFlow.totalOut)} left the account`}
      />
      <StatTile
        label="Charged to cards"
        value={formatMoney(cashFlow.creditPurchases)}
        detail="Leaves the account when those statements are paid"
      />
      {mode === "MONTH" && (
        <StatTile
          label="Card bills still to pay"
          value={formatMoney(outstanding)}
          detail={outstanding > 0 ? "On this month's statements" : "Nothing left to pay this month"}
        />
      )}
    </div>
  );
}

function Breakdowns({ data }: { data: SummaryView }) {
  const { t } = useI18n();
  const income = data.cashFlow.income;
  const fixedBillsTotal = data.fixedBills.reduce((sum, line) => sum + line.total, 0);

  return (
    <div className="grid items-start gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
      <Card className="gap-3 p-4">
        <CardKicker>Day-to-day spending</CardKicker>
        <CategoryBars lines={data.expenses} emptyMessage="No day-to-day spending in this period." />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>Card statements</CardKicker>
        <CardStatementsList lines={data.cards} />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>Fixed bills</CardKicker>
        <BreakdownTable
          rows={data.fixedBills}
          rowKey={(line) => line.category.id}
          emptyMessage="No fixed bills in this period."
          columns={[
            { header: "Bill", render: (line) => line.category.name },
            { header: "Amount", align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: "Of money in", align: "right", render: (line) => share(line.share) },
          ]}
          footer={[
            "Total",
            formatMoneyWithMinus(fixedBillsTotal),
            share(income > 0 ? fixedBillsTotal / income : 0),
          ]}
        />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>Money in & savings</CardKicker>
        <BreakdownTable
          rows={[...data.income, ...data.savings]}
          rowKey={(line) => line.category.id}
          emptyMessage="No income or savings in this period."
          columns={[
            { header: "Category", render: (line) => line.category.name },
            { header: "Amount", align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: "Of money in", align: "right", render: (line) => share(line.share) },
          ]}
        />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>How day-to-day was paid</CardKicker>
        <BreakdownTable
          rows={data.paymentMethods.filter((line) => line.total !== 0)}
          rowKey={(line) => line.paymentMethod ?? "none"}
          emptyMessage="No day-to-day spending in this period."
          columns={[
            { header: "Method", render: (line) => paymentMethodLabel(line.paymentMethod, t) },
            { header: "Amount", align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: "Of money in", align: "right", render: (line) => share(line.share) },
          ]}
        />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>From which account</CardKicker>
        <BreakdownTable
          rows={data.accounts}
          rowKey={(line) => line.card?.id ?? "none"}
          emptyMessage="No day-to-day spending in this period."
          columns={[
            { header: "Account", render: (line) => line.card?.nickname ?? "Cash & not informed" },
            { header: "Total", align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: "Debit", align: "right", render: (line) => formatMoneyWithMinus(line.debit) },
            { header: "Credit", align: "right", render: (line) => formatMoneyWithMinus(line.credit) },
          ]}
        />
      </Card>
    </div>
  );
}
