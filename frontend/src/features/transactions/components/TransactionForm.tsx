import { useState, type FormEvent } from "react";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { Button } from "@/shared/ui/Button";
import { formatYearMonth, todayIso } from "@/shared/lib/dates";
import { formatMoney, parseMoneyInput } from "@/shared/lib/money";
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
import { statementMonthFor } from "@/features/cards/lib/statement-month";
import { MAX_INSTALLMENTS, type TransactionInput } from "../types";

export interface TransactionFormValues {
  date: string;
  description: string;
  categoryId: string;
  amount: string;
  paymentMethod: PaymentMethod | "";
  cardId: string;
  installments: string;
}

interface TransactionFormProps {
  initial?: Partial<TransactionFormValues>;
  submitLabel: string;
  onSubmit: (input: TransactionInput) => Promise<void>;
  onCancel?: () => void;
  // Clears only description and amount after adding, for fast entry.
  keepAfterSubmit?: boolean;
  recurringTransactionId?: string | null;
  // References that may no longer be selectable (deleted since).
  knownCategory?: { id: string; name: string } | null;
  knownCard?: { id: string; nickname: string } | null;
  // Explains what the form is about to do, above the computed hint.
  context?: string;
}

const EMPTY_VALUES: TransactionFormValues = {
  date: "",
  description: "",
  categoryId: "",
  amount: "",
  paymentMethod: "",
  cardId: "",
  installments: "1",
};

function defaultCategoryId(categories: Category[]): string {
  return (categories.find((category) => category.kind === "EXPENSE") ?? categories[0])?.id ?? "";
}

export function TransactionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  keepAfterSubmit,
  recurringTransactionId = null,
  knownCategory,
  knownCard,
  context,
}: TransactionFormProps) {
  const { categories } = useCategories();
  const { cards } = useCards();

  const [values, setValues] = useState<TransactionFormValues>(() => ({
    ...EMPTY_VALUES,
    date: todayIso(),
    ...initial,
  }));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derived picks: sensible defaults until the lists load or the user chooses.
  const categoryId = values.categoryId || defaultCategoryId(categories);
  const category = categories.find((c) => c.id === categoryId);
  const creditAllowed = !category || acceptsCreditCard(category.kind);
  const paymentMethod: PaymentMethod | "" =
    values.paymentMethod === "CREDIT" && !creditAllowed ? "" : values.paymentMethod;
  const isCredit = paymentMethod === "CREDIT";
  const cardId = values.cardId || (isCredit ? (cards[0]?.id ?? "") : "");
  const card = cards.find((c) => c.id === cardId);
  const installments = Math.min(
    Math.max(parseInt(values.installments, 10) || 1, 1),
    MAX_INSTALLMENTS,
  );

  function update<K extends keyof TransactionFormValues>(field: K, value: TransactionFormValues[K]) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseMoneyInput(values.amount);

    if (!categoryId) return setError("Pick a category first — add one in Settings.");
    if (!values.date) return setError("Pick the date.");
    if (!amount) return setError("Type the amount.");
    if (isCredit && !cardId) return setError("Pick the card it was charged to.");

    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        categoryId,
        date: values.date,
        description: values.description.trim() || null,
        amount,
        paymentMethod: paymentMethod || null,
        cardId: cardId || null,
        installments: isCredit ? installments : 1,
        recurringTransactionId,
      });
      if (keepAfterSubmit) {
        setValues((previous) => ({ ...previous, description: "", amount: "", installments: "1" }));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hint = describe({
    kind: category?.kind,
    isCredit,
    cardName: card?.nick,
    statementMonth: card && isCredit ? statementMonthFor(card, values.date) : null,
    installments,
    amount: parseMoneyInput(values.amount),
  });

  const categoryIsListed = categories.some((c) => c.id === categoryId);
  const cardIsListed = cards.some((c) => c.id === cardId);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="Date" htmlFor="txn-date" className="flex-[0_1_150px]">
          <Input
            id="txn-date"
            type="date"
            required
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </Field>
        <Field label="Description" htmlFor="txn-description" className="min-w-0 flex-[2_1_160px]">
          <Input
            id="txn-description"
            placeholder="Optional"
            maxLength={140}
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </Field>
        <Field label="Category" htmlFor="txn-category" className="min-w-0 flex-[1_1_150px]">
          <Select
            id="txn-category"
            value={categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
          >
            {!categoryIsListed && knownCategory && (
              <option value={knownCategory.id}>{knownCategory.name} (removed)</option>
            )}
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
        <Field label="Amount" htmlFor="txn-amount" className="flex-[0_1_120px]">
          <Input
            id="txn-amount"
            inputMode="decimal"
            placeholder="0,00"
            required
            value={values.amount}
            onChange={(e) => update("amount", e.target.value)}
          />
        </Field>
        <Field label="Paid with" htmlFor="txn-method" className="min-w-0 flex-[1_1_140px]">
          <Select
            id="txn-method"
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
          htmlFor="txn-card"
          className="min-w-0 flex-[1_1_140px]"
        >
          <Select id="txn-card" value={cardId} onChange={(e) => update("cardId", e.target.value)}>
            {!isCredit && <option value="">—</option>}
            {!cardIsListed && knownCard && cardId === knownCard.id && (
              <option value={knownCard.id}>{knownCard.nickname} (removed)</option>
            )}
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nick}
              </option>
            ))}
          </Select>
        </Field>
        {isCredit && (
          <Field label="Installments" htmlFor="txn-installments" className="flex-[0_1_96px]">
            <Input
              id="txn-installments"
              type="number"
              min={1}
              max={MAX_INSTALLMENTS}
              value={values.installments}
              onChange={(e) => update("installments", e.target.value)}
            />
          </Field>
        )}
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
      {(context || hint) && (
        <p className="m-0 text-[11.5px] text-ink/55">
          {context && <span className="text-ink/75">{context} </span>}
          {hint}
        </p>
      )}
      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </form>
  );
}

function describe({
  kind,
  isCredit,
  cardName,
  statementMonth,
  installments,
  amount,
}: {
  kind?: Category["kind"];
  isCredit: boolean;
  cardName?: string;
  statementMonth: string | null;
  installments: number;
  amount: number;
}): string {
  if (isCredit && statementMonth) {
    const statement = `the ${formatYearMonth(statementMonth)} statement${cardName ? ` of ${cardName}` : ""}`;
    return installments > 1 && amount > 0
      ? `${installments}× of about ${formatMoney(amount / installments)}, starting on ${statement}.`
      : `Lands on ${statement} — it leaves your account when that bill is paid.`;
  }
  switch (kind) {
    case "INCOME":
      return "Counts as money in on that day.";
    case "SAVINGS":
      return "Moves money into savings. Use a negative amount for money taken back out.";
    case "FIXED_BILL":
    case "EXPENSE":
      return "Leaves your account on that day. Negative amounts are refunds.";
    default:
      return "";
  }
}
