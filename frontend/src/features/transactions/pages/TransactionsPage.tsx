import { useState } from "react";
import { PlusCircle } from "@phosphor-icons/react";
import { Card } from "@/shared/ui/Card";
import { Dialog } from "@/shared/ui/Dialog";
import { Field } from "@/shared/ui/Field";
import { Select } from "@/shared/ui/Select";
import { MonthSwitcher } from "@/shared/ui/MonthSwitcher";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth, dateInMonth, formatYearMonth, todayIso } from "@/shared/lib/dates";
import { formatMoney, formatMoneyInput } from "@/shared/lib/money";
import { ApiError } from "@/lib/http/api-error";
import { useCategories } from "@/features/categories/context/CategoriesContext";
import { useLedger } from "@/features/reports/hooks/use-reports";
import type { LedgerEntry } from "@/features/reports/types";
import { LedgerTable } from "../components/LedgerTable";
import { TransactionForm, type TransactionFormValues } from "../components/TransactionForm";
import { useTransactionActions } from "../hooks/use-transaction-actions";
import { entryTitle } from "../lib/ledger-display";

type DialogState = { mode: "edit" | "adjust"; entry: LedgerEntry };

function formValuesOf(entry: LedgerEntry): Partial<TransactionFormValues> {
  return {
    date: entry.date,
    description: entry.description ?? "",
    categoryId: entry.category?.id ?? "",
    amount: formatMoneyInput(entry.amount),
    paymentMethod: entry.paymentMethod ?? "",
    cardId: entry.card?.id ?? "",
    installments: String(entry.installments),
  };
}

export function TransactionsPage() {
  const [month, setMonth] = useState(currentYearMonth);
  const [filterCategory, setFilterCategory] = useState("all");
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { categories } = useCategories();
  const ledger = useLedger(month);
  const { createTransaction, updateTransaction, removeTransaction, removeStatementPayment } =
    useTransactionActions();

  const entries = ledger.data?.entries ?? [];
  const visible =
    filterCategory === "all"
      ? entries
      : entries.filter((entry) => entry.category?.id === filterCategory);

  const moneyIn = visible
    .filter((entry) => entry.kind === "INCOME")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const spent = visible
    .filter((entry) => entry.kind === "EXPENSE" || entry.kind === "FIXED_BILL")
    .reduce((sum, entry) => sum + entry.amount, 0);

  // New entries default to today's day number, inside the month on screen.
  const defaultDate = dateInMonth(month, Number(todayIso().slice(8, 10)));

  async function handleRemove(entry: LedgerEntry) {
    setActionError(null);
    try {
      if (entry.source === "CARD_PAYMENT" && entry.paymentId) {
        await removeStatementPayment(entry.paymentId);
      } else if (entry.transactionId) {
        await removeTransaction(entry.transactionId);
      }
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : `Couldn't delete "${entryTitle(entry)}".`,
      );
    }
  }

  return (
    <div>
      <div className="mb-4.5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="mb-0.5">Transactions</h3>
          <p className="m-0 text-[13px] text-ink/55">
            {visible.length} entries · {formatMoney(moneyIn)} in · {formatMoney(spent)} spent
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <MonthSwitcher month={month} onChange={setMonth} />
          <Field label="Category" htmlFor="filter-category" className="w-[170px]">
            <Select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <Card className="mb-4 gap-3 p-3.5">
        <div className="flex items-center gap-2">
          <PlusCircle size={15} className="text-accent" />
          <span className="text-[13px] font-medium">Log a transaction</span>
        </div>
        <TransactionForm
          key={month}
          initial={{ date: defaultDate }}
          submitLabel="Add"
          keepAfterSubmit
          onSubmit={async (input) => {
            await createTransaction(input);
          }}
        />
      </Card>

      {actionError && <p className="mb-3 text-[12.5px] text-accent-300">{actionError}</p>}
      {ledger.error && (
        <p className="mb-3 text-[12.5px] text-accent-300">
          Couldn't load {formatYearMonth(month)}: {ledger.error.message}
        </p>
      )}

      <div className={cn("transition-opacity", ledger.isLoading && "opacity-60")}>
        <LedgerTable
          entries={visible}
          emptyMessage={
            ledger.isLoading
              ? "Loading…"
              : `Nothing in ${formatYearMonth(month)} yet. Log the first one above.`
          }
          onEdit={(entry) => setDialog({ mode: "edit", entry })}
          onAdjust={(entry) => setDialog({ mode: "adjust", entry })}
          onRemove={(entry) => void handleRemove(entry)}
        />
      </div>

      <Dialog
        open={dialog !== null}
        title={dialog?.mode === "adjust" ? "Log the actual value" : "Edit transaction"}
        onClose={() => setDialog(null)}
      >
        {dialog && (
          <TransactionForm
            key={dialog.entry.key}
            initial={formValuesOf(dialog.entry)}
            submitLabel={dialog.mode === "adjust" ? "Log it" : "Save"}
            recurringTransactionId={dialog.entry.recurringTransactionId}
            knownCategory={dialog.entry.category}
            knownCard={dialog.entry.card}
            context={
              dialog.mode === "adjust"
                ? `Replaces the automatic "${entryTitle(dialog.entry)}" of ${formatYearMonth(month)}.`
                : undefined
            }
            onCancel={() => setDialog(null)}
            onSubmit={async (input) => {
              if (dialog.mode === "adjust") {
                await createTransaction(input);
              } else if (dialog.entry.transactionId) {
                await updateTransaction(dialog.entry.transactionId, input);
              }
              setDialog(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
