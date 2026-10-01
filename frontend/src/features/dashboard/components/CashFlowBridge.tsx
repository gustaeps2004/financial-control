import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { formatMoney, formatPercent, formatSignedMoney } from "@/shared/lib/money";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { CashFlow } from "@/features/reports/types";

interface Step {
  // Also names the step: its label is the cash flow's own.
  key: keyof CashFlow;
  // Signed effect on the account: money in positive, money out negative.
  delta: number;
  // Totals start from zero; steps continue from the running balance.
  kind: "total" | "step";
}

interface CashFlowBridgeProps {
  cashFlow: CashFlow;
}

// Colors follow the dataviz emphasis form: the two ends of the bridge (what
// came in, what was left) in the accent, every step in between in the
// de-emphasis gray — both measured >= 3:1 against the card surface.
const ACCENT = "var(--color-accent)";
const STEP = "var(--color-neutral-600)";
const SHORT = "var(--color-danger)";

function stepsOf(cashFlow: CashFlow): Step[] {
  return [
    { key: "income", delta: cashFlow.income, kind: "total" },
    { key: "fixedBills", delta: -cashFlow.fixedBills, kind: "step" },
    { key: "cardBills", delta: -cashFlow.cardBills, kind: "step" },
    { key: "cashExpenses", delta: -cashFlow.cashExpenses, kind: "step" },
    { key: "savings", delta: -cashFlow.savings, kind: "step" },
    { key: "leftover", delta: cashFlow.leftover, kind: "total" },
  ];
}

// Every bar spans [from, to] on a shared scale: totals rise from zero, steps
// continue from the running balance left by the bar before them.
function placeSteps(steps: Step[]): Array<Step & { from: number; to: number }> {
  const placed: Array<Step & { from: number; to: number }> = [];
  let running = 0;
  for (const step of steps) {
    const from = step.kind === "total" ? 0 : running;
    const to = step.kind === "total" ? step.delta : running + step.delta;
    running = to;
    placed.push({ ...step, from, to });
  }
  return placed;
}

/**
 * The spreadsheet's panorama as a bridge: what came in, each way it left the
 * account, and what was left — the equation "Sobrou = Entradas − Total que
 * saiu − Guardado", drawn.
 */
export function CashFlowBridge({ cashFlow }: CashFlowBridgeProps) {
  const { t } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const steps = stepsOf(cashFlow);

  const bars = placeSteps(steps);
  const values = bars.flatMap((bar) => [bar.from, bar.to]);
  const top = Math.max(0, ...values);
  const bottom = Math.min(0, ...values);
  const range = top - bottom || 1;
  const position = (value: number) => ((value - bottom) / range) * 100;

  return (
    <div>
      <div className="relative h-[168px]" role="list" aria-label={t.dashboard.bridgeLabel}>
        {/* Zero baseline */}
        <span
          aria-hidden
          className="absolute right-0 left-0 h-px bg-divider"
          style={{ bottom: `${position(0)}%` }}
        />
        <div className="absolute inset-0 grid grid-cols-6">
          {bars.map((bar, index) => {
            const low = Math.min(bar.from, bar.to);
            const high = Math.max(bar.from, bar.to);
            const goesDown = bar.to < bar.from;
            const isLeftover = bar.key === "leftover";
            const color = isLeftover && bar.to < 0 ? SHORT : bar.kind === "total" ? ACCENT : STEP;
            const share = cashFlow.income > 0 ? Math.abs(bar.delta) / cashFlow.income : null;
            const next = bars[index + 1];
            return (
              <div
                key={bar.key}
                role="listitem"
                tabIndex={0}
                aria-label={`${t.cashFlow[bar.key]}: ${formatSignedMoney(bar.delta)}`}
                onPointerEnter={() => setActive(bar.key)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(bar.key)}
                onBlur={() => setActive(null)}
                className="relative flex justify-center outline-none focus-visible:bg-ink/4"
              >
                {high - low > 0 && (
                  <span
                    className={cn(
                      "absolute w-6 transition-[filter]",
                      active === bar.key && "brightness-125",
                      // The data end is rounded; the end tied to the previous
                      // level (or to zero) stays square.
                      goesDown ? "rounded-b-[4px]" : "rounded-t-[4px]",
                    )}
                    style={{
                      bottom: `${position(low)}%`,
                      height: `max(2px, ${position(high) - position(low)}%)`,
                      background: color,
                    }}
                  />
                )}
                {/* Connector to the next bar, at the running balance */}
                {next && (
                  <span
                    aria-hidden
                    className="absolute left-1/2 h-px w-full bg-neutral-700"
                    style={{ bottom: `${position(bar.to)}%` }}
                  />
                )}
                {active === bar.key && (
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute z-10 rounded-md bg-canvas px-2.5 py-1.5 text-[12px] whitespace-nowrap shadow-[var(--shadow-elev-md)]"
                    style={{ bottom: `calc(${position(high)}% + 8px)` }}
                  >
                    <b className="block font-semibold tabular-nums">{formatSignedMoney(bar.delta)}</b>
                    <span className="text-ink/60">
                      {t.cashFlow[bar.key]}
                      {share !== null &&
                        bar.key !== "income" &&
                        ` · ${t.dashboard.shareOfIncome(formatPercent(share))}`}
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Values under each bar where there is room; a plain list on phones. */}
      <dl className="m-0 mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 border-t border-divider pt-2.5 text-[12.5px] sm:hidden">
        {bars.map((bar) => (
          <div key={bar.key} className="contents">
            <dt className="text-ink/60">{t.cashFlow[bar.key]}</dt>
            <dd className={cn("m-0 text-right tabular-nums", bar.kind === "total" && "font-medium")}>
              {bar.kind === "total" && bar.delta >= 0
                ? formatMoney(bar.delta)
                : formatSignedMoney(bar.delta)}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-2.5 hidden grid-cols-6 border-t border-divider pt-2 sm:grid">
        {bars.map((bar) => (
          <div key={bar.key} className="flex min-w-0 flex-col items-center gap-0.5 px-0.5 text-center">
            <span className="text-[11.5px] text-ink/60">{t.cashFlow[bar.key]}</span>
            <span
              className={cn(
                "text-[12.5px] tabular-nums",
                bar.kind === "total" ? "font-medium text-ink" : "text-ink/85",
              )}
            >
              {bar.kind === "total" && bar.delta >= 0
                ? formatMoney(bar.delta)
                : formatSignedMoney(bar.delta)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
