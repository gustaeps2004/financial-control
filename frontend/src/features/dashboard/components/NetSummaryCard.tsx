import { Card, CardKicker } from "@/shared/ui/Card";
import { formatMoney } from "@/features/finance-data/lib/selectors";

interface NetSummaryCardProps {
  income: number;
  expense: number;
}

export function NetSummaryCard({ income, expense }: NetSummaryCardProps) {
  const net = income - expense;
  const total = income + expense || 1;
  const incomePct = Math.round((income / total) * 100);
  const expensePct = 100 - incomePct;

  const hint =
    net >= 0
      ? `You kept ${Math.round((net / (income || 1)) * 100)}% of what came in.`
      : `Spending outran income by ${formatMoney(net)}.`;

  return (
    <Card className="gap-2.5 p-4">
      <CardKicker>Net this month</CardKicker>
      <div
        className="text-[34px] leading-none font-medium tracking-[-0.025em] tabular-nums"
        style={{ color: net < 0 ? "var(--color-accent-300)" : "var(--color-ink)" }}
      >
        {net < 0 ? "− " : ""}
        {formatMoney(net)}
      </div>
      <div className="flex h-2 overflow-hidden rounded-sm bg-track">
        <span className="bg-accent" style={{ width: `${incomePct}%` }} />
        <span className="bg-accent-700" style={{ width: `${expensePct}%` }} />
      </div>
      <div className="flex justify-between text-[12px]">
        <span className="text-neutral-400">
          In <b className="font-medium text-ink tabular-nums">{formatMoney(income)}</b>
        </span>
        <span className="text-neutral-400">
          Out <b className="font-medium text-ink tabular-nums">{formatMoney(expense)}</b>
        </span>
      </div>
      <p className="m-0 text-[11px] text-ink/55">{hint}</p>
    </Card>
  );
}
