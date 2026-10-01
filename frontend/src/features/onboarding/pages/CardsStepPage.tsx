import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, PlusCircle } from "@phosphor-icons/react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Card } from "@/shared/ui/Card";
import { cn } from "@/shared/lib/cn";
import { formatMoney, parseMoneyInput } from "@/shared/lib/money";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCards } from "@/features/cards/context/CardsContext";
import { CARD_BRANDS } from "../constants";

export function CardsStepPage() {
  const { cards, addCard, updateCard, removeCard, removeCardsByBrand } = useCards();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);

  async function toggleBrand(brand: (typeof CARD_BRANDS)[number]) {
    const inUse = cards.some((c) => c.brand === brand.name);
    try {
      setError(null);
      if (inUse) {
        await removeCardsByBrand(brand.name);
      } else {
        await addCard({
          brand: brand.name,
          mark: brand.mark,
          swatch: brand.swatch,
          nick: t.cards.defaultNickname(brand.name),
        });
      }
    } catch (err) {
      setError(errorMessage(err, t, t.cards.updateFailed));
    }
  }

  async function commitField(
    id: string,
    patch: { nick?: string; limit?: number; closeDay?: string; dueDay?: string },
  ) {
    try {
      setError(null);
      await updateCard(id, patch);
    } catch (err) {
      setError(errorMessage(err, t, t.cards.saveFailed));
    }
  }

  async function handleRemove(id: string) {
    try {
      setError(null);
      await removeCard(id);
    } catch (err) {
      setError(errorMessage(err, t, t.cards.removeFailed));
    }
  }

  return (
    <div>
      <h2 className="mb-2">{t.onboarding.cards.title}</h2>
      <p className="mb-6 max-w-[490px] text-[14px] text-ink/55 text-pretty">
        {t.onboarding.cards.intro}
      </p>

      <div className="mb-7.5 grid max-w-[760px] grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-2.5">
        {CARD_BRANDS.map((brand) => {
          const on = cards.some((c) => c.brand === brand.name);
          const Icon = on ? CheckCircle : PlusCircle;
          return (
            <button
              key={brand.name}
              type="button"
              onClick={() => void toggleBrand(brand)}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-md border p-2.5 text-left",
                on ? "border-accent bg-accent/10" : "border-transparent bg-surface",
              )}
            >
              <span
                className="grid h-[21px] w-8 flex-none place-items-center rounded text-[8px] font-semibold tracking-[0.06em]"
                style={{ background: brand.swatch }}
              >
                {brand.mark}
              </span>
              <span className="min-w-0 flex-1 text-[13px]">{brand.name}</span>
              <Icon size={15} className={on ? "text-accent" : "text-neutral-700"} />
            </button>
          );
        })}
      </div>

      <h5 className="mb-3">{t.onboarding.cards.yourCards}</h5>
      <div className="mb-3 flex max-w-[840px] flex-col gap-2.5">
        {cards.map((card) => (
          <Card key={card.id} className="flex-row flex-wrap items-end gap-3 p-3">
            <span
              className="mb-1.5 h-[25px] w-[38px] flex-none rounded text-[8px] font-semibold"
              style={{ background: card.swatch, display: "grid", placeItems: "center" }}
            >
              {card.mark}
            </span>
            <Field label={t.cards.nickname} className="min-w-0 flex-[2_1_140px]">
              <Input
                key={`${card.id}-nick`}
                defaultValue={card.nick}
                onBlur={(e) => void commitField(card.id, { nick: e.target.value })}
              />
            </Field>
            <Field label={t.cards.limit} className="flex-[0_1_112px]">
              <Input
                key={`${card.id}-limit`}
                defaultValue={formatMoney(card.limit)}
                onBlur={(e) =>
                  void commitField(card.id, { limit: parseMoneyInput(e.target.value) })
                }
              />
            </Field>
            <Field label={t.cards.closingDay} className="flex-[0_1_96px]">
              <Input
                key={`${card.id}-closeDay`}
                inputMode="numeric"
                defaultValue={card.closeDay}
                onBlur={(e) => void commitField(card.id, { closeDay: e.target.value })}
              />
            </Field>
            <Field label={t.cards.dueDay} className="flex-[0_1_96px]">
              <Input
                key={`${card.id}-dueDay`}
                inputMode="numeric"
                placeholder="—"
                defaultValue={card.dueDay}
                onBlur={(e) => void commitField(card.id, { dueDay: e.target.value })}
              />
            </Field>
            <Button
              variant="ghost"
              className="mb-1 flex-none"
              onClick={() => void handleRemove(card.id)}
            >
              {t.cards.remove}
            </Button>
          </Card>
        ))}
      </div>

      {cards.length > 0 && (
        <p className="mb-4 max-w-[640px] text-[12px] text-ink/55 text-pretty">
          {t.onboarding.cards.statementRule}
        </p>
      )}

      {error && <p className="mb-4 text-[12px] text-accent-300">{error}</p>}

      <div className="flex gap-2">
        <Button variant="primary" onClick={() => navigate("/setup/recurring")}>
          {t.common.continue}
        </Button>
        <Button variant="secondary" onClick={() => navigate("/setup/categories")}>
          {t.common.back}
        </Button>
      </div>
    </div>
  );
}
