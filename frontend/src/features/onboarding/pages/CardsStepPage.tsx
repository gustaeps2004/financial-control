import { useNavigate } from "react-router-dom";
import { CheckCircle, PlusCircle } from "@phosphor-icons/react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Card } from "@/shared/ui/Card";
import { cn } from "@/shared/lib/cn";
import { formatMoney, parseMoneyInput } from "@/shared/lib/money";
import { useFinanceData } from "@/features/finance-data/context/FinanceDataContext";
import { CARD_BRANDS } from "../constants";

export function CardsStepPage() {
  const { cards, addCard, updateCard, removeCard, removeCardsByBrand } = useFinanceData();
  const navigate = useNavigate();

  function toggleBrand(brand: (typeof CARD_BRANDS)[number]) {
    const inUse = cards.some((c) => c.brand === brand.name);
    if (inUse) {
      removeCardsByBrand(brand.name);
    } else {
      addCard({
        brand: brand.name,
        mark: brand.mark,
        swatch: brand.swatch,
        nick: `${brand.name} card`,
      });
    }
  }

  return (
    <div>
      <h2 className="mb-2">Which cards do you carry?</h2>
      <p className="mb-6 max-w-[490px] text-[14px] text-ink/55 text-pretty">
        Pick the brands you own, then name each one. These become the options you see
        when logging a purchase.
      </p>

      <div className="mb-7.5 grid max-w-[760px] grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-2.5">
        {CARD_BRANDS.map((brand) => {
          const on = cards.some((c) => c.brand === brand.name);
          const Icon = on ? CheckCircle : PlusCircle;
          return (
            <button
              key={brand.name}
              type="button"
              onClick={() => toggleBrand(brand)}
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

      <h5 className="mb-3">Your cards</h5>
      <div className="mb-7.5 flex max-w-[840px] flex-col gap-2.5">
        {cards.map((card) => (
          <Card key={card.id} className="flex-row flex-wrap items-end gap-3 p-3">
            <span
              className="mb-1.5 h-[25px] w-[38px] flex-none rounded text-[8px] font-semibold"
              style={{ background: card.swatch, display: "grid", placeItems: "center" }}
            >
              {card.mark}
            </span>
            <Field label="Nickname" className="min-w-0 flex-[2_1_140px]">
              <Input
                value={card.nick}
                onChange={(e) => updateCard(card.id, { nick: e.target.value })}
              />
            </Field>
            <Field label="Last 4" className="flex-[0_1_86px]">
              <Input
                value={card.last4}
                maxLength={4}
                onChange={(e) => updateCard(card.id, { last4: e.target.value })}
              />
            </Field>
            <Field label="Limit" className="flex-[0_1_112px]">
              <Input
                value={formatMoney(card.limit)}
                onChange={(e) => updateCard(card.id, { limit: parseMoneyInput(e.target.value) })}
              />
            </Field>
            <Field label="Closes day" className="flex-[0_1_96px]">
              <Input
                value={card.closeDay}
                onChange={(e) => updateCard(card.id, { closeDay: e.target.value })}
              />
            </Field>
            <Button variant="ghost" className="mb-1 flex-none" onClick={() => removeCard(card.id)}>
              Remove
            </Button>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="primary" onClick={() => navigate("/setup/recurring")}>
          Continue
        </Button>
        <Button variant="secondary" onClick={() => navigate("/setup/categories")}>
          Back
        </Button>
      </div>
    </div>
  );
}
