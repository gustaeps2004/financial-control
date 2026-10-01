import { useState, type FormEvent } from "react";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { MonthInput } from "@/shared/ui/MonthInput";
import { currentYearMonth, formatYearMonth, todayIso } from "@/shared/lib/dates";
import { parseMoneyInput } from "@/shared/lib/money";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/shared/lib/payment-methods";
import { ApiError } from "@/lib/http/api-error";
import { useCategories } from "@/features/categories/context/CategoriesContext";
import {
  CATEGORY_KINDS,
  CATEGORY_KIND_LABELS,
  acceptsCreditCard,
  type Category,
} from "@/features/categories/types";
import { useCards } from "@/features/cards/context/CardsContext";
import type { RecurringTransactionInput } from "../types";

export interface RecurringFormValues {
  description: string;
  categoryId: string;
  amount: string;
  dayOfMonth: string;
  startMonth: string;
  endMonth: string;
  paymentMethod: PaymentMethod | "";
  cardId: string;
}

interface RecurringFormProps {
  initial?: Partial<RecurringFormValues>;
  submitLabel: string;
  onSubmit: (input: RecurringTransactionInput) => Promise<void>;
  onCancel?: () => void;
  resetAfterSubmit?: boolean;
}

function defaultCategoryId(categories: Category[]): string {
  return (
    (categories.find((category) => category.kind === "FIXED_BILL") ?? categories[0])?.id ?? ""
  );
}

function emptyValues(): RecurringFormValues {
  return {
    description: "",
    categoryId: "",
    amount: "",
    dayOfMonth: String(Number(todayIso().slice(8, 10))),
    startMonth: currentYearMonth(),
    endMonth: "",
    paymentMethod: "",
    cardId: "",
  };
}

export function RecurringForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  resetAfterSubmit,
}: RecurringFormProps) {
  const { categories } = useCategories();
  const { cards } = useCards();
  const [values, setValues] = useState<RecurringFormValues>(() => ({
    ...emptyValues(),
    ...initial,
  }));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryId = values.categoryId || defaultCategoryId(categories);
  const category = categories.find((c) => c.id === categoryId);
  const creditAllowed = !category || acceptsCreditCard(category.kind);
  const paymentMethod: PaymentMethod | "" =
    values.paymentMethod === "CREDIT" && !creditAllowed ? "" : values.paymentMethod;
  const isCredit = paymentMethod === "CREDIT";
  const cardId = values.cardId || (isCredit ? (cards[0]?.id ?? "") : "");
  const day = parseInt(values.dayOfMonth, 10);

  function update<K extends keyof RecurringFormValues>(field: K, value: RecurringFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseMoneyInput(values.amount);

    if (!values.description.trim()) return setError("Give it a name, like “Internet”.");
    if (!categoryId) return setError("Pick a category first — add one in Settings.");
    if (amount <= 0) return setError("Type the monthly amount.");
    if (!(day >= 1 && day <= 31)) return setError("The day must be between 1 and 31.");
    if (values.endMonth && values.endMonth < values.startMonth) {
      return setError("It can't end before it starts.");
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        categoryId,
        description: values.description.trim(),
        amount,
        dayOfMonth: day,
        startMonth: values.startMonth,
        endMonth: values.endMonth || null,
        paymentMethod: paymentMethod || null,
        cardId: cardId || null,
      });
      if (resetAfterSubmit) {
        setValues((previous) => ({ ...previous, description: "", amount: "" }));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const period = values.endMonth
    ? `from ${formatYearMonth(values.startMonth)} to ${formatYearMonth(values.endMonth)}`
    : `from ${formatYearMonth(values.startMonth)} on`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Name" htmlFor="rec-description" className="min-w-0 flex-[2_1_150px]">
          <Input
            id="rec-description"
            placeholder="Internet"
            maxLength={140}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <Field label="Category" htmlFor="rec-category" className="min-w-0 flex-[1_1_150px]">
          <Select
            id="rec-category"
            value={categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            {CATEGORY_KINDS.map((kind) => {
              const ofKind = categories.filter((c) => c.kind === kind);
              if (ofKind.length === 0) return null;
              return (
                <optgroup key={kind} label={CATEGORY_KIND_LABELS[kind]}>
                  {ofKind.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </Select>
        </Field>
        <Field label="Monthly amount" htmlFor="rec-amount" className="flex-[0_1_130px]">
          <Input
            id="rec-amount"
            inputMode="decimal"
            placeholder="0,00"
            value={values.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </Field>
        <Field label="Day" htmlFor="rec-day" className="flex-[0_1_72px]">
          <Input
            id="rec-day"
            type="number"
            min={1}
            max={31}
            value={values.dayOfMonth}
            onChange={(e) => update("dayOfMonth", e.target.value)}
          />
        </Field>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Starts" htmlFor="rec-start" className="min-w-0 flex-[1_1_210px]">
          <MonthInput
            id="rec-start"
            label="Starts"
            value={values.startMonth}
            onChange={(value) => update("startMonth", value || currentYearMonth())}
          />
        </Field>
        <Field label="Ends" htmlFor="rec-end" className="min-w-0 flex-[1_1_210px]">
          <MonthInput
            id="rec-end"
            label="Ends"
            emptyLabel="No end"
            value={values.endMonth}
            onChange={(value) => update("endMonth", value)}
          />
        </Field>
        <Field label="Paid with" htmlFor="rec-method" className="min-w-0 flex-[1_1_140px]">
          <Select
            id="rec-method"
            value={paymentMethod}
            onChange={(e) => update("paymentMethod", e.target.value as PaymentMethod | "")}
          >
            <option value="">Not informed</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method} disabled={method === "CREDIT" && !creditAllowed}>
                {PAYMENT_METHOD_LABELS[method]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={isCredit ? "Card" : "Account"}
          htmlFor="rec-card"
          className="min-w-0 flex-[1_1_140px]"
        >
          <Select id="rec-card" value={cardId} onChange={(e) => update("cardId", e.target.value)}>
            {!isCredit && <option value="">—</option>}
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nick}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-none gap-1.5">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      <p className="m-0 text-[11.5px] text-ink/55">
        Posted automatically on day {day >= 1 && day <= 31 ? day : "…"} of every month {period}
        {isCredit ? ", on the card's statement" : ""}. When a month's value differs, log the
        actual one from Transactions — it replaces the automatic one.
      </p>
      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </form>
  );
}
