import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { currentYearMonth } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCards } from "@/features/cards/context/CardsContext";
import { RecurringForm } from "@/features/recurring/components/RecurringForm";
import { RecurringTable } from "@/features/recurring/components/RecurringTable";
import { useRecurringTransactions } from "@/features/recurring/hooks/use-recurring";
import { CarriedAmountInput } from "@/features/statements/components/CarriedAmountInput";

export function RecurringStepPage() {
  const { recurring, createRecurring, removeRecurring } = useRecurringTransactions();
  const { cards } = useCards();
  const navigate = useNavigate();
  const { t } = useI18n();
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
      setError(errorMessage(err, t, t.onboarding.recurring.removeFailed));
    }
  }

  return (
    <div>
      <h2 className="mb-2">{t.onboarding.recurring.title}</h2>
      <p className="mb-6.5 max-w-[560px] text-[14px] text-ink/55 text-pretty">
        {t.onboarding.recurring.intro}
      </p>

      <h5 className="mb-2.5">{t.onboarding.recurring.heading}</h5>
      <Card className="mb-3.5 max-w-[920px] p-3.5">
        <RecurringForm
          submitLabel={t.common.add}
          resetAfterSubmit
          onSubmit={async (input) => {
            await createRecurring(input);
          }}
        />
      </Card>
      <div className="mb-2 max-w-[920px]">
        <RecurringTable
          recurring={recurring}
          emptyMessage={t.onboarding.recurring.empty}
          onRemove={(item) => void handleRemove(item.id)}
        />
      </div>
      {error && <p className="mb-3 text-[12px] text-accent-300">{error}</p>}
      <p className="mb-8 text-[12.5px] text-ink/55">
        {t.onboarding.recurring.monthlyTotal(formatMoney(monthlyTotal))}
      </p>

      {cards.length > 0 && (
        <>
          <h5 className="mb-1">{t.onboarding.recurring.cardsTitle}</h5>
          <p className="mb-3 max-w-[560px] text-[12.5px] text-ink/55 text-pretty">
            {t.onboarding.recurring.cardsIntro}
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
          {t.onboarding.recurring.finish}
        </Button>
        <Button variant="secondary" onClick={() => navigate("/setup/cards")}>
          {t.common.back}
        </Button>
      </div>
    </div>
  );
}
