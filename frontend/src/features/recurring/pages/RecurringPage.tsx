import { useState } from "react";
import { Repeat } from "@phosphor-icons/react";
import { Card } from "@/shared/ui/Card";
import { Dialog } from "@/shared/ui/Dialog";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth } from "@/shared/lib/dates";
import { formatMoney, formatMoneyInput } from "@/shared/lib/money";
import { errorMessage } from "@/lib/i18n/error-message";
import { useI18n } from "@/lib/i18n/i18n-context";
import { RecurringForm } from "../components/RecurringForm";
import { RecurringTable } from "../components/RecurringTable";
import { useRecurringTransactions } from "../hooks/use-recurring";
import type { RecurringTransaction } from "../types";

export function RecurringPage() {
  const { t } = useI18n();
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
      setActionError(errorMessage(err, t, failure));
    }
  }

  function handleRemove(item: RecurringTransaction) {
    if (!window.confirm(t.recurring.confirmDelete(item.description))) return;
    void run(() => removeRecurring(item.id), t.recurring.deleteFailed(item.description));
  }

  return (
    <div>
      <div className="mb-4.5">
        <h3 className="mb-0.5">{t.recurring.title}</h3>
        <p className="m-0 max-w-[620px] text-[13px] text-ink/55 text-pretty">
          {t.recurring.intro(activeNow.length, formatMoney(monthlyTotal))}
        </p>
      </div>

      <Card className="mb-4 gap-3 p-3.5">
        <div className="flex items-center gap-2">
          <Repeat size={15} className="text-accent" />
          <span className="text-[13px] font-medium">{t.recurring.addTitle}</span>
        </div>
        <RecurringForm
          submitLabel={t.common.add}
          resetAfterSubmit
          onSubmit={async (input) => {
            await createRecurring(input);
          }}
        />
      </Card>

      {actionError && <p className="mb-3 text-[12.5px] text-accent-300">{actionError}</p>}
      {error && (
        <p className="mb-3 text-[12.5px] text-accent-300">
          {errorMessage(error, t, t.recurring.loadFailed)}
        </p>
      )}

      <div className={cn("transition-opacity", isLoading && "opacity-60")}>
        <RecurringTable
          recurring={recurring}
          emptyMessage={isLoading ? t.common.loading : t.recurring.empty}
          onEdit={setEditing}
          onEnd={(item) =>
            void run(
              () => updateRecurring(item.id, { endMonth: thisMonth }),
              t.recurring.endFailed(item.description),
            )
          }
          onRemove={handleRemove}
        />
      </div>

      <Dialog open={editing !== null} title={t.recurring.editTitle} onClose={() => setEditing(null)}>
        {editing && (
          <RecurringForm
            key={editing.id}
            submitLabel={t.common.save}
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
