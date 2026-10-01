import { useState, type FormEvent } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { cn } from "@/shared/lib/cn";
import { formatDayMonth, todayIso } from "@/shared/lib/dates";
import { formatMoney, formatMoneyInput, parseMoneyInput } from "@/shared/lib/money";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useCardStatement } from "@/features/reports/hooks/use-reports";
import type { Statement } from "@/features/reports/types";
import { useStatementActions } from "../hooks/use-statement-actions";
import { STATUS_CLASSES, statusSentence } from "../lib/status";

interface StatementDetailProps {
  cardId: string;
  month: string;
}

function Breakdown({ statement }: { statement: Statement }) {
  const { t } = useI18n();
  const labels = t.statements.detail;
  const rows: Array<[string, number]> = [
    [labels.olderInstallments, statement.installments],
    [labels.purchases, statement.purchases],
    [labels.recurring, statement.recurring],
  ];
  return (
    <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[13px]">
      {rows.map(([label, amount]) => (
        <div key={label} className="contents">
          <dt className="text-ink/60">{label}</dt>
          <dd className="m-0 text-right tabular-nums">{formatMoney(amount)}</dd>
        </div>
      ))}
      <dt className="border-t border-divider pt-1 font-medium">{labels.total}</dt>
      <dd className="m-0 border-t border-divider pt-1 text-right font-medium tabular-nums">
        {formatMoney(statement.total)}
      </dd>
      <dt className="text-ink/60">{labels.paid}</dt>
      <dd className="m-0 text-right tabular-nums">{formatMoney(statement.paid)}</dd>
      <dt className="text-ink/60">{labels.remaining}</dt>
      <dd
        className={cn(
          "m-0 text-right tabular-nums",
          statement.remaining > 0 && statement.status === "OVERDUE" && "text-danger",
        )}
      >
        {formatMoney(Math.max(0, statement.remaining))}
      </dd>
    </dl>
  );
}

export function StatementDetail({ cardId, month }: StatementDetailProps) {
  const { t } = useI18n();
  const labels = t.statements.detail;
  const detail = useCardStatement({ cardId, month });
  const { setAdjustment, registerPayment, removePayment } = useStatementActions();
  const [paidOn, setPaidOn] = useState(todayIso);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (detail.error) {
    return (
      <p className="m-0 text-[13px] text-accent-300">
        {errorMessage(detail.error, t, labels.loadFailed)}
      </p>
    );
  }
  if (!detail.data) {
    return <p className="m-0 text-[13px] text-ink/55">{t.common.loading}</p>;
  }

  const { statement, charges } = detail.data;
  const suggestedPayment = statement.remaining > 0 ? statement.remaining : statement.total;

  async function commitAdjustment(value: string) {
    const next = parseMoneyInput(value);
    if (next === statement.adjustment) return;
    try {
      setError(null);
      await setAdjustment(cardId, month, next);
    } catch (err) {
      setError(errorMessage(err, t, labels.carriedFailed));
    }
  }

  async function handlePay(event: FormEvent) {
    event.preventDefault();
    const value = amount ? parseMoneyInput(amount) : suggestedPayment;
    if (value <= 0) return setError(labels.typeAmountPaid);
    try {
      setError(null);
      await registerPayment(cardId, month, { paidOn, amount: value });
      setAmount("");
    } catch (err) {
      setError(errorMessage(err, t, labels.registerFailed));
    }
  }

  async function handleRemovePayment(paymentId: string) {
    try {
      setError(null);
      await removePayment(paymentId);
    } catch (err) {
      setError(errorMessage(err, t, labels.deleteFailed));
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", detail.isLoading && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn("rounded px-1.5 text-[11px] leading-5", STATUS_CLASSES[statement.status])}
        >
          {t.statements.status[statement.status]}
        </span>
        <span className="text-[12.5px] text-ink/60">{statusSentence(statement, t)}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label={labels.carriedLabel} htmlFor="statement-carried">
          <Input
            id="statement-carried"
            key={`carried-${statement.adjustment}`}
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={statement.adjustment ? formatMoneyInput(statement.adjustment) : ""}
            onBlur={(e) => void commitAdjustment(e.target.value)}
          />
          <span className="mt-1 text-[11px] text-ink/50">{labels.carriedHint}</span>
        </Field>
        <Breakdown statement={statement} />
      </div>

      <section className="flex flex-col gap-1.5">
        <h5 className="m-0 text-[13px]">{labels.charges}</h5>
        {charges.length === 0 ? (
          <p className="m-0 text-[12.5px] text-ink/50">{labels.noCharges}</p>
        ) : (
          <div className="max-h-[260px] overflow-y-auto">
            <Table>
              <TableHead>
                <Th className="w-14">{t.fields.date}</Th>
                <Th>{t.fields.description}</Th>
                <Th className="w-16">{labels.installmentShort}</Th>
                <Th className="text-right">{t.fields.amount}</Th>
              </TableHead>
              <TableBody>
                {charges.map((charge) => (
                  <TableRow key={charge.key}>
                    <Td className="text-[12.5px] tabular-nums text-ink/55">
                      {formatDayMonth(charge.date)}
                    </Td>
                    <Td className="text-[13px]">
                      {charge.description ?? charge.category?.name ?? "—"}
                      {charge.source === "RECURRING" && (
                        <span className="ml-1.5 text-[11px] text-ink/45">{labels.recurringTag}</span>
                      )}
                    </Td>
                    <Td className="text-[12px] tabular-nums text-ink/55">
                      {charge.installments > 1 ? `${charge.installment}/${charge.installments}` : "—"}
                    </Td>
                    <Td className="text-right tabular-nums">{formatMoney(charge.amount)}</Td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h5 className="m-0 text-[13px]">{labels.payments}</h5>
        {statement.payments.map((payment) => (
          <div key={payment.id} className="flex items-center gap-2 text-[13px]">
            <span className="text-ink/60">{labels.paidOn(payment.paidOn)}</span>
            <span className="ml-auto tabular-nums">{formatMoney(payment.amount)}</span>
            <button
              type="button"
              aria-label={labels.deletePayment(formatMoney(payment.amount))}
              onClick={() => void handleRemovePayment(payment.id)}
              className="inline-grid size-7 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-neutral-500 hover:bg-ink/7 hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <form onSubmit={handlePay} className="flex flex-wrap items-end gap-2">
          <Field label={labels.paidOnLabel} htmlFor="payment-date" className="flex-[0_1_160px]">
            <Input
              id="payment-date"
              type="date"
              required
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
            />
          </Field>
          <Field label={t.fields.amount} htmlFor="payment-amount" className="flex-[0_1_140px]">
            <Input
              id="payment-amount"
              inputMode="decimal"
              placeholder={formatMoneyInput(suggestedPayment)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="primary" disabled={suggestedPayment <= 0 && !amount}>
            {labels.register}
          </Button>
        </form>
        <p className="m-0 text-[11.5px] text-ink/50">{labels.paymentNote}</p>
      </section>

      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </div>
  );
}
