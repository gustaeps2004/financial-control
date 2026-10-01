import { useState } from "react";
import { Repeat } from "@phosphor-icons/react";
import { Card } from "@/shared/ui/Card";
import { Dialog } from "@/shared/ui/Dialog";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth } from "@/shared/lib/dates";
import { formatMoney, formatMoneyInput } from "@/shared/lib/money";
import { ApiError } from "@/lib/http/api-error";
import { RecurringForm } from "../components/RecurringForm";
import { RecurringTable } from "../components/RecurringTable";
import { useRecurringTransactions } from "../hooks/use-recurring";
import type { RecurringTransaction } from "../types";

export function RecurringPage() {
  const { recurring, isLoading, error, createRecurring, updateRecurring, removeRecurring } =
    useRecurringTransactions();
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const thisMonth = currentYearMonth();
  const activeNow = recurring.filter(
    (item) => item.startMonth <= thisMonth && (!item.endMonth || item.endMonth >= thisMonth),
  );
  const monthlyTotal = activeNow.reduce((sum, item) => sum + item.amount, 0);

  async function run(action: () => Promise<unknown>, failure: string) {
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : failure);
    }
  }

  function handleRemove(item: RecurringTransaction) {
    const confirmed = window.confirm(
      `Delete "${item.description}"? Its automatic entries disappear from every month, past ones included. To stop it from now on, use End instead.`,
    );
    if (!confirmed) return;
    void run(() => removeRecurring(item.id), `Couldn't delete "${item.description}".`);
  }

  return (
    <div>
      <div className="mb-4.5">
        <h3 className="mb-0.5">Recurring</h3>
        <p className="m-0 max-w-[620px] text-[13px] text-ink/55 text-pretty">
          Bills, subscriptions and income that repeat every month post themselves — months
          ahead show up as projections. {activeNow.length} active this month,{" "}
          {formatMoney(monthlyTotal)} in total.
        </p>
      </div>

      <Card className="mb-4 gap-3 p-3.5">
        <div className="flex items-center gap-2">
          <Repeat size={15} className="text-accent" />
          <span className="text-[13px] font-medium">Add something that repeats</span>
        </div>
        <RecurringForm
          submitLabel="Add"
          resetAfterSubmit
          onSubmit={async (input) => {
            await createRecurring(input);
          }}
        />
      </Card>

      {actionError && <p className="mb-3 text-[12.5px] text-accent-300">{actionError}</p>}
      {error && <p className="mb-3 text-[12.5px] text-accent-300">{error.message}</p>}

      <div className={cn("transition-opacity", isLoading && "opacity-60")}>
        <RecurringTable
          recurring={recurring}
          emptyMessage={isLoading ? "Loading…" : "Nothing repeats yet. Add your first fixed bill above."}
          onEdit={setEditing}
          onEnd={(item) =>
            void run(
              () => updateRecurring(item.id, { endMonth: thisMonth }),
              `Couldn't end "${item.description}".`,
            )
          }
          onRemove={handleRemove}
        />
      </div>

      <Dialog open={editing !== null} title="Edit recurring" onClose={() => setEditing(null)}>
        {editing && (
          <RecurringForm
            key={editing.id}
            submitLabel="Save"
            initial={{
              description: editing.description,
              categoryId: editing.categoryId,
              amount: formatMoneyInput(editing.amount),
              dayOfMonth: String(editing.dayOfMonth),
              startMonth: editing.startMonth,
              endMonth: editing.endMonth ?? "",
              paymentMethod: editing.paymentMethod ?? "",
              cardId: editing.cardId ?? "",
            }}
            onCancel={() => setEditing(null)}
            onSubmit={async (input) => {
              await updateRecurring(editing.id, input);
              setEditing(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
}
