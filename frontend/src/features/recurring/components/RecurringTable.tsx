import { PencilSimple, X } from "@phosphor-icons/react";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { Tag } from "@/shared/ui/Tag";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Messages } from "@/lib/i18n/messages/en";
import { useCategories } from "@/features/categories/context/CategoriesContext";
import { useCards } from "@/features/cards/context/CardsContext";
import type { RecurringTransaction } from "../types";

interface RecurringTableProps {
  recurring: RecurringTransaction[];
  emptyMessage: string;
  onEdit?: (item: RecurringTransaction) => void;
  onEnd?: (item: RecurringTransaction) => void;
  onRemove?: (item: RecurringTransaction) => void;
}

const iconButtonClasses =
  "inline-grid size-7 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-neutral-500 hover:bg-ink/7 hover:text-ink";

type Status = "ACTIVE" | "ENDING" | "ENDED" | "STARTS";

function statusOf(item: RecurringTransaction, thisMonth: string): Status {
  if (item.startMonth > thisMonth) return "STARTS";
  if (item.endMonth && item.endMonth < thisMonth) return "ENDED";
  if (item.endMonth) return "ENDING";
  return "ACTIVE";
}

function periodLabel(item: RecurringTransaction, t: Messages): string {
  return item.endMonth
    ? t.recurring.table.range(item.startMonth, item.endMonth)
    : t.recurring.table.since(item.startMonth);
}

export function RecurringTable({ recurring, emptyMessage, onEdit, onEnd, onRemove }: RecurringTableProps) {
  const { categories } = useCategories();
  const { cards } = useCards();
  const { t } = useI18n();
  const thisMonth = currentYearMonth();

  if (recurring.length === 0) {
    return <p className="py-5 text-[13px] text-ink/55">{emptyMessage}</p>;
  }

  const hasActions = Boolean(onEdit || onEnd || onRemove);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <Th>{t.fields.name}</Th>
          <Th>{t.fields.category}</Th>
          <Th className="w-14">{t.fields.day}</Th>
          <Th>{t.recurring.table.period}</Th>
          <Th>{t.fields.paidWith}</Th>
          <Th className="text-right">{t.recurring.table.monthly}</Th>
          {hasActions && <Th className="w-px" />}
        </TableHead>
        <TableBody>
          {recurring.map((item) => {
            const status = statusOf(item, thisMonth);
            const category = categories.find((c) => c.id === item.categoryId);
            const card = cards.find((c) => c.id === item.cardId);
            const paidWith = [
              item.paymentMethod ? t.paymentMethods[item.paymentMethod] : null,
              card?.nick,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <TableRow key={item.id} className={cn(status === "ENDED" && "opacity-55")}>
                <Td>{item.description}</Td>
                <Td>{category ? <Tag>{category.name}</Tag> : <span className="text-ink/45">—</span>}</Td>
                <Td className="tabular-nums text-ink/60">{item.dayOfMonth}</Td>
                <Td className="text-[12.5px]">
                  <span className="text-ink/75">{periodLabel(item, t)}</span>
                  {status === "ENDED" && (
                    <span className="ml-1.5 text-ink/45">· {t.recurring.table.ended}</span>
                  )}
                  {status === "STARTS" && (
                    <span className="ml-1.5 text-accent">· {t.recurring.table.upcoming}</span>
                  )}
                </Td>
                <Td className="text-[12.5px] text-ink/60">{paidWith || "—"}</Td>
                <Td className="text-right whitespace-nowrap tabular-nums">{formatMoney(item.amount)}</Td>
                {hasActions && (
                  <Td className="text-right whitespace-nowrap">
                    {onEdit && (
                      <button
                        type="button"
                        aria-label={t.common.edit(item.description)}
                        className={iconButtonClasses}
                        onClick={() => onEdit(item)}
                      >
                        <PencilSimple size={14} />
                      </button>
                    )}
                    {onEnd && (status === "ACTIVE" || status === "ENDING") && (
                      <button
                        type="button"
                        title={t.recurring.table.endHint}
                        className="cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-[12px] text-accent hover:bg-accent/10"
                        onClick={() => onEnd(item)}
                      >
                        {t.recurring.table.end}
                      </button>
                    )}
                    {onRemove && (
                      <button
                        type="button"
                        aria-label={t.common.delete(item.description)}
                        className={iconButtonClasses}
                        onClick={() => onRemove(item)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </Td>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
