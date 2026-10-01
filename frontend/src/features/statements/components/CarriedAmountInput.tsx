import { useState } from "react";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { todayIso } from "@/shared/lib/dates";
import { formatMoneyInput, parseMoneyInput } from "@/shared/lib/money";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { CardAccount } from "@/features/cards/types";
import { statementMonthFor } from "@/features/cards/lib/statement-month";
import { useCardStatement } from "@/features/reports/hooks/use-reports";
import { useStatementActions } from "../hooks/use-statement-actions";

interface CarriedAmountInputProps {
  card: CardAccount;
  // Defaults to the statement open today.
  month?: string;
}

/**
 * What a statement already carries without being logged here — installments
 * of older purchases, subscriptions (the spreadsheet's "valor inicial").
 */
export function CarriedAmountInput({ card, month }: CarriedAmountInputProps) {
  const { t } = useI18n();
  const statementMonth = month ?? statementMonthFor(card, todayIso());
  const statement = useCardStatement(
    statementMonth ? { cardId: card.id, month: statementMonth } : null,
  );
  const { setAdjustment } = useStatementActions();
  const [error, setError] = useState<string | null>(null);

  if (!statementMonth) return null;

  const current = statement.data?.statement.adjustment ?? 0;

  async function commit(value: string) {
    const amount = parseMoneyInput(value);
    if (amount === current) return;
    try {
      setError(null);
      await setAdjustment(card.id, statementMonth!, amount);
    } catch (err) {
      setError(errorMessage(err, t, t.statements.carried.failed));
    }
  }

  return (
    <Field label={t.statements.carried.label(statementMonth)}>
      <Input
        // Remount once the saved value arrives, so the field shows it.
        key={statement.data ? `loaded-${current}` : "loading"}
        inputMode="decimal"
        placeholder="0,00"
        defaultValue={current ? formatMoneyInput(current) : ""}
        disabled={statement.isLoading && !statement.data}
        onBlur={(e) => void commit(e.target.value)}
      />
      {error && <span className="mt-1 text-[12px] text-accent-300">{error}</span>}
    </Field>
  );
}
