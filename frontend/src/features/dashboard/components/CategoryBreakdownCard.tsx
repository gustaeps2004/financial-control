import { Card, CardKicker } from "@/shared/ui/Card";
import { formatMoney } from "@/features/finance-data/lib/selectors";

const SHADES = ["#9184d9", "#7d71c4", "#6a5faf", "#57509a", "#464185", "#383470"];

interface CategoryBreakdownCardProps {
  totals: Array<[string, number]>;
}

export function CategoryBreakdownCard({ totals }: CategoryBreakdownCardProps) {
  const top = totals.slice(0, 6);
  const max = top[0]?.[1] ?? 1;

  return (
    <Card className="gap-2.5 p-4">
      <CardKicker>Where it went</CardKicker>
      <div className="flex flex-col gap-2">
        {top.length === 0 && <p className="m-0 text-[12.5px] text-ink/55">No spending yet.</p>}
        {top.map(([name, amount], index) => (
          <div key={name} className="flex flex-col gap-1">
            <div className="flex justify-between text-[12.5px]">
              <span>{name}</span>
              <span className="tabular-nums text-neutral-400">{formatMoney(amount)}</span>
            </div>
            <span className="block h-1 rounded-sm bg-track">
              <span
                className="block h-1 rounded-sm"
                style={{
                  width: `${Math.round((amount / max) * 100)}%`,
                  background: SHADES[index % SHADES.length],
                }}
              />
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
