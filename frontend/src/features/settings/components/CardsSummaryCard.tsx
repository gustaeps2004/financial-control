import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardKicker } from "@/shared/ui/Card";
import { buttonVariants } from "@/shared/ui/Button";
import { ApiError } from "@/lib/http/api-error";
import { useCards } from "@/features/cards/context/CardsContext";

export function CardsSummaryCard() {
  const { cards, removeCard } = useCards();
  const [error, setError] = useState<string | null>(null);

  async function handleRemove(id: string) {
    try {
      setError(null);
      await removeCard(id);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't remove that card. Please try again.",
      );
    }
  }

  return (
    <Card className="gap-3 p-4">
      <CardKicker>Cards</CardKicker>
      <div className="flex flex-col gap-2.5">
        {cards.length === 0 && <p className="m-0 text-[12.5px] text-ink/55">No cards yet.</p>}
        {cards.map((card) => (
          <div key={card.id} className="flex items-center gap-2.5">
            <span
              className="grid h-5 w-[30px] flex-none place-items-center rounded text-[7px] font-semibold"
              style={{ background: card.swatch }}
            >
              {card.mark}
            </span>
            <span className="min-w-0 flex-1 truncate text-[12.5px]">{card.nick}</span>
            <button
              type="button"
              onClick={() => void handleRemove(card.id)}
              className="cursor-pointer border-0 bg-transparent text-accent"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
      <Link
        to="/setup/cards"
        className={buttonVariants({ variant: "secondary", className: "self-start" })}
      >
        Add a card
      </Link>
    </Card>
  );
}
