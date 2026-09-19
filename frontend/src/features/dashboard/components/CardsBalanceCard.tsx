import { Card, CardKicker } from "@/shared/ui/Card";
import { cardBalance, formatMoney } from "@/features/finance-data/lib/selectors";
import type { CardAccount, Transaction } from "@/features/finance-data/types";

interface CardsBalanceCardProps {
  cards: CardAccount[];
  monthTransactions: Transaction[];
}

export function CardsBalanceCard({ cards, monthTransactions }: CardsBalanceCardProps) {
  return (
    <Card className="gap-2.5 p-4">
      <CardKicker>Cards</CardKicker>
      <div className="flex flex-col gap-3">
        {cards.length === 0 && <p className="m-0 text-[12.5px] text-ink/55">No cards yet.</p>}
        {cards.map((card) => {
          const balance = cardBalance(card, monthTransactions);
          const spent = monthTransactions
            .filter((t) => t.kind === "out" && t.cardId === card.id)
            .reduce((sum, t) => sum + t.amount, 0);
          const pct = Math.min(100, Math.round((balance / (card.limit || 1)) * 100));
          return (
            <div key={card.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className="grid h-[19px] w-7 flex-none place-items-center rounded text-[7px] font-semibold"
                  style={{ background: card.swatch }}
                >
                  {card.mark}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px]">{card.nick}</span>
                <span className="text-[12.5px] tabular-nums">{formatMoney(balance)}</span>
              </div>
              <span className="block h-1 rounded-sm bg-track">
                <span className="block h-1 rounded-sm bg-accent" style={{ width: `${pct}%` }} />
              </span>
              <span className="text-[11px] text-ink/55">
                {formatMoney(spent)} this month · closes day {card.closeDay}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
