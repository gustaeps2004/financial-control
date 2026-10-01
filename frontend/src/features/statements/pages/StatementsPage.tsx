import { useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/shared/ui/Button";
import { Dialog } from "@/shared/ui/Dialog";
import { YearSwitcher } from "@/shared/ui/YearSwitcher";
import { cn } from "@/shared/lib/cn";
import { formatYearMonth } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { useCardStatements } from "@/features/reports/hooks/use-reports";
import { CardYearStrip } from "../components/CardYearStrip";
import { StatementDetail } from "../components/StatementDetail";

interface Selection {
  cardId: string;
  cardName: string;
  month: string;
}

export function StatementsPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selected, setSelected] = useState<Selection | null>(null);
  const statements = useCardStatements(year);
  const data = statements.data;

  return (
    <div>
      <div className="mb-4.5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">Statements</h3>
          <p className="m-0 max-w-[620px] text-[13px] text-ink/55 text-pretty">
            Every card's statement, month by month: what each one already carries, the
            installments landing on it and what you bought this cycle.
            {data && ` ${formatMoney(data.total)} across all cards in ${data.year}.`}
          </p>
        </div>
        <YearSwitcher year={year} onChange={setYear} />
      </div>

      {statements.error && (
        <p className="mb-3 text-[12.5px] text-accent-300">{statements.error.message}</p>
      )}

      <div className={cn("flex flex-col gap-3.5 transition-opacity", statements.isLoading && "opacity-60")}>
        {data && data.cards.length === 0 && (
          <div className="flex flex-col items-start gap-3 py-5">
            <p className="m-0 text-[13px] text-ink/55">
              No cards yet. Add the cards you carry to follow their statements.
            </p>
            <Link to="/setup/cards" className={buttonVariants({ variant: "secondary" })}>
              Add a card
            </Link>
          </div>
        )}
        {data?.cards.map(({ card, statements: cardStatements, total }) => (
          <CardYearStrip
            key={card.id}
            card={card}
            statements={cardStatements}
            total={total}
            onOpen={(month) => setSelected({ cardId: card.id, cardName: card.nickname, month })}
          />
        ))}
      </div>

      <Dialog
        open={selected !== null}
        title={selected ? `${selected.cardName} · ${formatYearMonth(selected.month)} statement` : ""}
        onClose={() => setSelected(null)}
        size="lg"
      >
        {selected && <StatementDetail cardId={selected.cardId} month={selected.month} />}
      </Dialog>
    </div>
  );
}
