import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { currentYearMonth } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { ApiError } from "@/lib/http/api-error";
import { useCards } from "@/features/cards/context/CardsContext";
import { RecurringForm } from "@/features/recurring/components/RecurringForm";
import { RecurringTable } from "@/features/recurring/components/RecurringTable";
import { useRecurringTransactions } from "@/features/recurring/hooks/use-recurring";
import { CarriedAmountInput } from "@/features/statements/components/CarriedAmountInput";

export function RecurringStepPage() {
  const { recurring, createRecurring, removeRecurring } = useRecurringTransactions();
  const { cards } = useCards();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const thisMonth = currentYearMonth();
  const monthlyTotal = recurring
    .filter((item) => item.startMonth <= thisMonth && (!item.endMonth || item.endMonth >= thisMonth))
    .reduce((sum, item) => sum + item.amount, 0);

  async function handleRemove(id: string) {
    try {
      setError(null);
      await removeRecurring(id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't remove it. Please try again.");
    }
  }

  return (
    <div>
      <h2 className="mb-2">What repeats every month?</h2>
      <p className="mb-6.5 max-w-[560px] text-[14px] text-ink/55 text-pretty">
        Fixed bills, subscriptions and even your salary post themselves every month — future
        months show up as projections. Then tell us what each card's current statement
        already carries, so your first month starts from the truth.
      </p>

      <h5 className="mb-2.5">Recurring</h5>
      <Card className="mb-3.5 max-w-[920px] p-3.5">
        <RecurringForm
          submitLabel="Add"
          resetAfterSubmit
          onSubmit={async (input) => {
            await createRecurring(input);
          }}
        />
      </Card>
      <div className="mb-2 max-w-[920px]">
        <RecurringTable
          recurring={recurring}
          emptyMessage="Nothing yet — rent, internet, financing, subscriptions…"
          onRemove={(item) => void handleRemove(item.id)}
        />
      </div>
      {error && <p className="mb-3 text-[12px] text-accent-300">{error}</p>}
      <p className="mb-8 text-[12.5px] text-ink/55">
        {formatMoney(monthlyTotal)} a month in recurring items this month.
      </p>

      {cards.length > 0 && (
        <>
          <h5 className="mb-1">What your cards already carry</h5>
          <p className="mb-3 max-w-[560px] text-[12.5px] text-ink/55 text-pretty">
            Installments of older purchases and anything else already on the current
            statement. You can set the next statements later, in Statements.
          </p>
          <div className="mb-2 grid max-w-[920px] gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {cards.map((card) => (
              <Card key={card.id} className="gap-2.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid h-[21px] w-8 flex-none place-items-center rounded text-[8px] font-semibold"
                    style={{ background: card.swatch }}
                  >
                    {card.mark}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px]">{card.nick}</span>
                </div>
                <CarriedAmountInput card={card} />
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="mt-7.5 flex gap-2">
        <Button variant="primary" onClick={() => navigate("/app/dashboard")}>
          Finish setup
        </Button>
        <Button variant="secondary" onClick={() => navigate("/setup/cards")}>
          Back
        </Button>
      </div>
    </div>
  );
}
