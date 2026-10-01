import { useState, type FormEvent } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "@/shared/ui/Button";
import { Field } from "@/shared/ui/Field";
import { Input } from "@/shared/ui/Input";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { cn } from "@/shared/lib/cn";
import { formatDate, formatDayMonth, todayIso } from "@/shared/lib/dates";
import { formatMoney, formatMoneyInput, parseMoneyInput } from "@/shared/lib/money";
import { ApiError } from "@/lib/http/api-error";
import { useCardStatement } from "@/features/reports/hooks/use-reports";
import type { Statement } from "@/features/reports/types";
import { useStatementActions } from "../hooks/use-statement-actions";
import { STATUS_CLASSES, STATUS_LABELS, statusSentence } from "../lib/status";

interface StatementDetailProps {
  cardId: string;
  month: string;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

function Breakdown({ statement }: { statement: Statement }) {
  const rows: Array<[string, number]> = [
    ["Installments of older purchases", statement.installments],
    ["Purchases this cycle", statement.purchases],
    ["Recurring charges", statement.recurring],
  ];
  return (
    <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-[13px]">
      {rows.map(([label, amount]) => (
        <div key={label} className="contents">
          <dt className="text-ink/60">{label}</dt>
          <dd className="m-0 text-right tabular-nums">{formatMoney(amount)}</dd>
        </div>
      ))}
      <dt className="border-t border-divider pt-1 font-medium">Statement total</dt>
      <dd className="m-0 border-t border-divider pt-1 text-right font-medium tabular-nums">
        {formatMoney(statement.total)}
      </dd>
      <dt className="text-ink/60">Paid</dt>
      <dd className="m-0 text-right tabular-nums">{formatMoney(statement.paid)}</dd>
      <dt className="text-ink/60">Still to pay</dt>
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
  const detail = useCardStatement({ cardId, month });
  const { setAdjustment, registerPayment, removePayment } = useStatementActions();
  const [paidOn, setPaidOn] = useState(todayIso);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (detail.error) {
    return <p className="m-0 text-[13px] text-accent-300">{detail.error.message}</p>;
  }
  if (!detail.data) {
    return <p className="m-0 text-[13px] text-ink/55">Loading…</p>;
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
      setError(errorMessage(err, "Couldn't save the carried amount."));
    }
  }

  async function handlePay(event: FormEvent) {
    event.preventDefault();
    const value = amount ? parseMoneyInput(amount) : suggestedPayment;
    if (value <= 0) return setError("Type the amount paid.");
    try {
      setError(null);
      await registerPayment(cardId, month, { paidOn, amount: value });
      setAmount("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't register the payment."));
    }
  }

  async function handleRemovePayment(paymentId: string) {
    try {
      setError(null);
      await removePayment(paymentId);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete the payment."));
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", detail.isLoading && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn("rounded px-1.5 text-[11px] leading-5", STATUS_CLASSES[statement.status])}
        >
          {STATUS_LABELS[statement.status]}
        </span>
        <span className="text-[12.5px] text-ink/60">{statusSentence(statement)}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Field label="Carried in (installments, subscriptions, fees)" htmlFor="statement-carried">
          <Input
            id="statement-carried"
            key={`carried-${statement.adjustment}`}
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={statement.adjustment ? formatMoneyInput(statement.adjustment) : ""}
            onBlur={(e) => void commitAdjustment(e.target.value)}
          />
          <span className="mt-1 text-[11px] text-ink/50">
            Anything already on this statement that wasn't logged here.
          </span>
        </Field>
        <Breakdown statement={statement} />
      </div>

      <section className="flex flex-col gap-1.5">
        <h5 className="m-0 text-[13px]">On this statement</h5>
        {charges.length === 0 ? (
          <p className="m-0 text-[12.5px] text-ink/50">No purchases land on it.</p>
        ) : (
          <div className="max-h-[260px] overflow-y-auto">
            <Table>
              <TableHead>
                <Th className="w-14">Date</Th>
                <Th>Description</Th>
                <Th className="w-16">Inst.</Th>
                <Th className="text-right">Amount</Th>
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
                        <span className="ml-1.5 text-[11px] text-ink/45">recurring</span>
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
        <h5 className="m-0 text-[13px]">Payments</h5>
        {statement.payments.map((payment) => (
          <div key={payment.id} className="flex items-center gap-2 text-[13px]">
            <span className="text-ink/60">Paid on {formatDate(payment.paidOn)}</span>
            <span className="ml-auto tabular-nums">{formatMoney(payment.amount)}</span>
            <button
              type="button"
              aria-label={`Delete payment of ${formatMoney(payment.amount)}`}
              onClick={() => void handleRemovePayment(payment.id)}
              className="inline-grid size-7 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-neutral-500 hover:bg-ink/7 hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        <form onSubmit={handlePay} className="flex flex-wrap items-end gap-2">
          <Field label="Paid on" htmlFor="payment-date" className="flex-[0_1_160px]">
            <Input
              id="payment-date"
              type="date"
              required
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
            />
          </Field>
          <Field label="Amount" htmlFor="payment-amount" className="flex-[0_1_140px]">
            <Input
              id="payment-amount"
              inputMode="decimal"
              placeholder={formatMoneyInput(suggestedPayment)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>
          <Button type="submit" variant="primary" disabled={suggestedPayment <= 0 && !amount}>
            Register payment
          </Button>
        </form>
        <p className="m-0 text-[11.5px] text-ink/50">
          The payment is what leaves your account — the purchases were already counted as
          spending when you made them.
        </p>
      </section>

      {error && <p className="m-0 text-[12px] text-accent-300">{error}</p>}
    </div>
  );
}
