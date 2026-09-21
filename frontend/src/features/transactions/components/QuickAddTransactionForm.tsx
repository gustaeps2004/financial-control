import { useState, type KeyboardEvent } from "react";
import { Lightning, PlusCircle } from "@phosphor-icons/react";
import { Card } from "@/shared/ui/Card";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { parseMoneyInput } from "@/shared/lib/money";
import { useFinanceData } from "@/features/finance-data/context/FinanceDataContext";
import { MONTH_NAMES_FULL } from "@/features/finance-data/lib/selectors";
import { useCategories } from "@/features/categories/context/CategoriesContext";
import type { PaymentMethod } from "@/features/finance-data/types";

interface QuickAddTransactionFormProps {
  year: number;
  month: number; // -1 means "all year" (transactions page only)
  compact?: boolean;
}

export function QuickAddTransactionForm({ year, month, compact }: QuickAddTransactionFormProps) {
  const { cards, addTransaction } = useFinanceData();
  const { categories } = useCategories();

  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("");
  const [hasDefaultedCat, setHasDefaultedCat] = useState(false);

  if (!hasDefaultedCat && categories.length > 0) {
    setHasDefaultedCat(true);
    setCat(categories[0]!.name);
  }

  const [amt, setAmt] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "income">("card");
  const [cardId, setCardId] = useState(cards[0]?.id ?? "");
  const [day, setDay] = useState(String(new Date().getDate()).padStart(2, "0"));

  const currentMonthName = MONTH_NAMES_FULL[new Date().getMonth()];
  const targetMonthName = month < 0 ? "the year" : MONTH_NAMES_FULL[month];

  const hint = compact
    ? method === "card"
      ? `Card purchases roll into that card's balance for ${targetMonthName}.`
      : method === "income"
        ? "Income adds to the month's net."
        : "Paid straight from your account — no card balance affected."
    : month < 0
      ? `Logging into ${currentMonthName} ${year} — pick a month above to file it elsewhere.`
      : `Files into ${MONTH_NAMES_FULL[month]} ${year}${method === "card" ? ", and rolls into that card's balance." : "."}`;

  function submit() {
    const amount = parseMoneyInput(amt);
    if (!amount) return;

    const kind = method === "income" ? "in" : "out";
    addTransaction({
      year,
      month: month < 0 ? new Date().getMonth() : month,
      day: parseInt(day, 10) || 1,
      desc: desc.trim() || (kind === "in" ? "Income" : cat),
      cat: kind === "in" ? "Income" : cat,
      amount,
      kind,
      method: method === "income" ? "pix" : method,
      cardId: method === "card" ? cardId : null,
    });
    setDesc("");
    setAmt("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  const Icon = compact ? Lightning : PlusCircle;

  return (
    <Card className="mb-4 gap-3 p-3.5">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-accent" />
        <span className="text-[10px] font-semibold tracking-[0.1em] text-accent uppercase">
          {compact ? "Quick entry" : "Add a purchase"}
        </span>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Description" className="min-w-0 flex-[2_1_150px]">
          <Input
            placeholder="Padaria"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Field>
        <Field label="Category" className="min-w-0 flex-[1_1_130px]">
          <Select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Amount" className="flex-[0_1_110px]">
          <Input
            placeholder="0,00"
            value={amt}
            onChange={(e) => setAmt(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </Field>
        <Field label="Paid with" className="min-w-0 flex-[1_1_120px]">
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | "income")}>
            <option value="card">Credit card</option>
            <option value="pix">Pix</option>
            <option value="debit">Debit</option>
            <option value="cash">Cash</option>
            <option value="income">Income</option>
          </Select>
        </Field>
        {method === "card" && (
          <Field label="Which card" className="min-w-0 flex-[1_1_150px]">
            <Select value={cardId} onChange={(e) => setCardId(e.target.value)}>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.nick} ···· {card.last4}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Day" className="flex-[0_1_72px]">
          <Input value={day} onChange={(e) => setDay(e.target.value)} onKeyDown={handleKeyDown} />
        </Field>
        <Button variant="primary" className="mb-0 flex-none" onClick={submit}>
          Add
        </Button>
      </div>
      <p className="m-0 text-[11px] text-ink/55">{hint}</p>
    </Card>
  );
}
