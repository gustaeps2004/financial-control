import { useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "@phosphor-icons/react";
import { Card, CardKicker } from "@/shared/ui/Card";
import { buttonVariants } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth, parseYearMonth } from "@/shared/lib/dates";
import { formatMoney, formatMoneyWithMinus, formatPercent } from "@/shared/lib/money";
import { paymentMethodLabel } from "@/shared/lib/payment-methods";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Messages } from "@/lib/i18n/messages/en";
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

function periodTitle(mode: PeriodMode, month: string, t: Messages): string {
  if (mode === "MONTH") return t.dates.yearMonth(month);
  if (mode === "YEAR") return String(parseYearMonth(month).year);
  return t.dashboard.allTime;
}

const share = (value: number) => (value > 0 ? formatPercent(value) : "—");

export function DashboardPage() {
  const { t } = useI18n();
  const [mode, setMode] = useState<PeriodMode>("MONTH");
  const [month, setMonth] = useState(currentYearMonth);

  const summary = useSummary(periodOf(mode, month));
  const annual = useAnnual(parseYearMonth(month).year);
  const data = summary.data;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">{periodTitle(mode, month, t)}</h3>
          <p className="m-0 text-[13px] text-ink/55">
            {mode === "MONTH" ? t.dashboard.monthIntro : t.dashboard.periodIntro}
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
          {t.dashboard.projectedNotice(month)}
        </p>
      )}
      {summary.error && (
        <p className="m-0 text-[12.5px] text-accent-300">
          {errorMessage(summary.error, t, t.dashboard.loadFailed)}
        </p>
      )}

      {data && (
        <div className={cn("flex flex-col gap-4 transition-opacity", summary.isLoading && "opacity-60")}>
          <OverviewCard data={data} />
          <KpiRow data={data} mode={mode} />

          {annual.data && (
            <Card className="gap-3 p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <CardKicker>{t.dashboard.yearByMonth(annual.data.year)}</CardKicker>
                <span className="text-[11.5px] text-ink/50">{t.dashboard.yearByMonthHint}</span>
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
  const { t } = useI18n();
  const { cashFlow } = data;
  const isShort = cashFlow.leftover < 0;
  const hasActivity =
    cashFlow.income !== 0 || cashFlow.totalOut !== 0 || cashFlow.savings !== 0;

  return (
    <Card className="gap-5 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[12.5px] text-ink/60">
            {isShort ? t.dashboard.shortBy : t.dashboard.leftOver}
          </span>
          {/* The one hero figure of the page; "Short by" already says it's negative. */}
          <span className="text-[40px] leading-none font-semibold tracking-[-0.03em] sm:text-[48px]">
            {formatMoney(cashFlow.leftover)}
          </span>
          <span className="text-[12.5px] text-ink/55">
            {cashFlow.income > 0
              ? t.dashboard.ofIncome(formatMoney(cashFlow.income))
              : t.dashboard.nothingCameIn}
          </span>
        </div>
        <Link to="/app/transactions" className={buttonVariants({ variant: "secondary" })}>
          {t.dashboard.logTransaction}
        </Link>
      </div>
      {hasActivity ? (
        <CashFlowBridge cashFlow={cashFlow} />
      ) : (
        <p className="m-0 text-[13px] text-ink/55">{t.dashboard.nothingRecorded}</p>
      )}
    </Card>
  );
}

function KpiRow({ data, mode }: { data: SummaryView; mode: PeriodMode }) {
  const { t } = useI18n();
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
        label={t.dashboard.kpis.saved}
        value={cashFlow.income > 0 ? formatPercent(cashFlow.savingsRate) : "—"}
        detail={
          cashFlow.savings < 0
            ? t.dashboard.kpis.takenFromSavings(formatMoney(cashFlow.savings))
            : t.dashboard.kpis.putAside(formatMoney(cashFlow.savings))
        }
      />
      <StatTile
        label={t.dashboard.kpis.committed}
        value={cashFlow.income > 0 ? formatPercent(cashFlow.committedRate) : "—"}
        detail={t.dashboard.kpis.leftTheAccount(formatMoney(cashFlow.totalOut))}
      />
      <StatTile
        label={t.dashboard.kpis.chargedToCards}
        value={formatMoney(cashFlow.creditPurchases)}
        detail={t.dashboard.kpis.chargedToCardsHint}
      />
      {mode === "MONTH" && (
        <StatTile
          label={t.dashboard.kpis.billsToPay}
          value={formatMoney(outstanding)}
          detail={outstanding > 0 ? t.dashboard.kpis.billsToPayHint : t.dashboard.kpis.nothingToPay}
        />
      )}
    </div>
  );
}

function Breakdowns({ data }: { data: SummaryView }) {
  const { t } = useI18n();
  const income = data.cashFlow.income;
  const fixedBillsTotal = data.fixedBills.reduce((sum, line) => sum + line.total, 0);
  const labels = t.dashboard.breakdowns;

  return (
    <div className="grid items-start gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))]">
      <Card className="gap-3 p-4">
        <CardKicker>{labels.dayToDay}</CardKicker>
        <CategoryBars lines={data.expenses} emptyMessage={labels.noDayToDay} />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>{labels.cardStatements}</CardKicker>
        <CardStatementsList lines={data.cards} />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>{labels.fixedBills}</CardKicker>
        <BreakdownTable
          rows={data.fixedBills}
          rowKey={(line) => line.category.id}
          emptyMessage={labels.noFixedBills}
          columns={[
            { header: labels.bill, render: (line) => line.category.name },
            { header: t.fields.amount, align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: labels.ofIncome, align: "right", render: (line) => share(line.share) },
          ]}
          footer={[
            t.common.total,
            formatMoneyWithMinus(fixedBillsTotal),
            share(income > 0 ? fixedBillsTotal / income : 0),
          ]}
        />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>{labels.incomeAndSavings}</CardKicker>
        <BreakdownTable
          rows={[...data.income, ...data.savings]}
          rowKey={(line) => line.category.id}
          emptyMessage={labels.noIncomeOrSavings}
          columns={[
            { header: t.fields.category, render: (line) => line.category.name },
            { header: t.fields.amount, align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: labels.ofIncome, align: "right", render: (line) => share(line.share) },
          ]}
        />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>{labels.howPaid}</CardKicker>
        <BreakdownTable
          rows={data.paymentMethods.filter((line) => line.total !== 0)}
          rowKey={(line) => line.paymentMethod ?? "none"}
          emptyMessage={labels.noDayToDay}
          columns={[
            { header: labels.method, render: (line) => paymentMethodLabel(line.paymentMethod, t) },
            { header: t.fields.amount, align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: labels.ofIncome, align: "right", render: (line) => share(line.share) },
          ]}
        />
      </Card>

      <Card className="gap-3 p-4">
        <CardKicker>{labels.fromWhichAccount}</CardKicker>
        <BreakdownTable
          rows={data.accounts}
          rowKey={(line) => line.card?.id ?? "none"}
          emptyMessage={labels.noDayToDay}
          columns={[
            { header: t.fields.account, render: (line) => line.card?.nickname ?? labels.cashAndNotInformed },
            { header: t.common.total, align: "right", render: (line) => formatMoneyWithMinus(line.total) },
            { header: labels.debit, align: "right", render: (line) => formatMoneyWithMinus(line.debit) },
            { header: labels.credit, align: "right", render: (line) => formatMoneyWithMinus(line.credit) },
          ]}
        />
      </Card>
    </div>
  );
}
