import { useState, type FormEvent } from "react";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { MonthInput } from "@/shared/ui/MonthInput";
import { currentYearMonth, todayIso } from "@/shared/lib/dates";
import { parseMoneyInput } from "@/shared/lib/money";
import { PAYMENT_METHODS, type PaymentMethod } from "@/shared/lib/payment-methods";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCategories } from "@/features/categories/context/CategoriesContext";
import { CATEGORY_KINDS, acceptsCreditCard, type Category } from "@/features/categories/types";
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
  const { t } = useI18n();
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
  const isValidDay = day >= 1 && day <= 31;

  function update<K extends keyof RecurringFormValues>(field: K, value: RecurringFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseMoneyInput(values.amount);

    if (!values.description.trim()) return setError(t.recurring.form.giveName);
    if (!categoryId) return setError(t.common.pickCategoryFirst);
    if (amount <= 0) return setError(t.recurring.form.typeMonthlyAmount);
    if (!isValidDay) return setError(t.recurring.form.dayRange);
    if (values.endMonth && values.endMonth < values.startMonth) {
      return setError(t.recurring.form.endBeforeStart);
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
      setError(errorMessage(err, t, t.common.saveFailed));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <Field label={t.fields.name} htmlFor="rec-description" className="min-w-0 flex-[2_1_150px]">
          <Input
            id="rec-description"
            placeholder={t.recurring.form.namePlaceholder}
            maxLength={140}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <Field label={t.fields.category} htmlFor="rec-category" className="min-w-0 flex-[1_1_150px]">
          <Select
            id="rec-category"
            value={categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            {CATEGORY_KINDS.map((kind) => {
              const ofKind = categories.filter((c) => c.kind === kind);
              if (ofKind.length === 0) return null;
              return (
                <optgroup key={kind} label={t.categories.kinds[kind]}>
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
        <Field label={t.recurring.form.monthlyAmount} htmlFor="rec-amount" className="flex-[0_1_130px]">
          <Input
            id="rec-amount"
            inputMode="decimal"
            placeholder="0,00"
            value={values.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </Field>
        <Field label={t.fields.day} htmlFor="rec-day" className="flex-[0_1_72px]">
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
        <Field label={t.recurring.form.starts} htmlFor="rec-start" className="min-w-0 flex-[1_1_210px]">
          <MonthInput
            id="rec-start"
            label={t.recurring.form.starts}
            value={values.startMonth}
            onChange={(value) => update("startMonth", value || currentYearMonth())}
          />
        </Field>
        <Field label={t.recurring.form.ends} htmlFor="rec-end" className="min-w-0 flex-[1_1_210px]">
          <MonthInput
            id="rec-end"
            label={t.recurring.form.ends}
            emptyLabel={t.recurring.form.noEnd}
            value={values.endMonth}
            onChange={(value) => update("endMonth", value)}
          />
        </Field>
        <Field label={t.fields.paidWith} htmlFor="rec-method" className="min-w-0 flex-[1_1_140px]">
          <Select
            id="rec-method"
            value={paymentMethod}
            onChange={(e) => update("paymentMethod", e.target.value as PaymentMethod | "")}
          >
            <option value="">{t.common.notInformed}</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method} disabled={method === "CREDIT" && !creditAllowed}>
                {t.paymentMethods[method]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={isCredit ? t.fields.card : t.fields.account}
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
            {isSubmitting ? t.common.saving : submitLabel}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              {t.common.cancel}
            </Button>
          )}
        </div>
      </div>
      <p className="m-0 text-[11.5px] text-ink/55">
        {t.recurring.form.explanation(
          isValidDay ? day : null,
          values.startMonth,
          values.endMonth || null,
          isCredit,
        )}
      </p>
      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </form>
  );
}
