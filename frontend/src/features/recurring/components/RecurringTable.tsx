import { PencilSimple, X } from "@phosphor-icons/react";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { Tag } from "@/shared/ui/Tag";
import { cn } from "@/shared/lib/cn";
import { currentYearMonth, formatYearMonth } from "@/shared/lib/dates";
import { formatMoney } from "@/shared/lib/money";
import { PAYMENT_METHOD_LABELS } from "@/shared/lib/payment-methods";
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

function periodLabel(item: RecurringTransaction): string {
  const start = formatYearMonth(item.startMonth);
  return item.endMonth ? `${start} → ${formatYearMonth(item.endMonth)}` : `Since ${start}`;
}

export function RecurringTable({ recurring, emptyMessage, onEdit, onEnd, onRemove }: RecurringTableProps) {
  const { categories } = useCategories();
  const { cards } = useCards();
  const thisMonth = currentYearMonth();

  if (recurring.length === 0) {
    return <p className="py-5 text-[13px] text-ink/55">{emptyMessage}</p>;
  }

  const hasActions = Boolean(onEdit || onEnd || onRemove);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <Th>Name</Th>
          <Th>Category</Th>
          <Th className="w-14">Day</Th>
          <Th>Period</Th>
          <Th>Paid with</Th>
          <Th className="text-right">Monthly</Th>
          {hasActions && <Th className="w-px" />}
        </TableHead>
        <TableBody>
          {recurring.map((item) => {
            const status = statusOf(item, thisMonth);
            const category = categories.find((c) => c.id === item.categoryId);
            const card = cards.find((c) => c.id === item.cardId);
            const paidWith = [
              item.paymentMethod ? PAYMENT_METHOD_LABELS[item.paymentMethod] : null,
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
                  <span className="text-ink/75">{periodLabel(item)}</span>
                  {status === "ENDED" && <span className="ml-1.5 text-ink/45">· ended</span>}
                  {status === "STARTS" && <span className="ml-1.5 text-accent">· upcoming</span>}
                </Td>
                <Td className="text-[12.5px] text-ink/60">{paidWith || "—"}</Td>
                <Td className="text-right whitespace-nowrap tabular-nums">{formatMoney(item.amount)}</Td>
                {hasActions && (
                  <Td className="text-right whitespace-nowrap">
                    {onEdit && (
                      <button
                        type="button"
                        aria-label={`Edit ${item.description}`}
                        className={iconButtonClasses}
                        onClick={() => onEdit(item)}
                      >
                        <PencilSimple size={14} />
                      </button>
                    )}
                    {onEnd && (status === "ACTIVE" || status === "ENDING") && (
                      <button
                        type="button"
                        title="Keep it in the past, stop it from next month on"
                        className="cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-[12px] text-accent hover:bg-accent/10"
                        onClick={() => onEnd(item)}
                      >
                        End
                      </button>
                    )}
                    {onRemove && (
                      <button
                        type="button"
                        aria-label={`Delete ${item.description}`}
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
