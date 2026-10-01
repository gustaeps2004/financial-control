import { PencilSimple, X } from "@phosphor-icons/react";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { Tag } from "@/shared/ui/Tag";
import { cn } from "@/shared/lib/cn";
import { formatDayMonth } from "@/shared/lib/dates";
import { formatSignedMoney } from "@/shared/lib/money";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { LedgerEntry } from "@/features/reports/types";
import { entryDetail, entryTitle, paidWithLabel, signedAmount } from "../lib/ledger-display";

interface LedgerTableProps {
  entries: LedgerEntry[];
  emptyMessage: string;
  onEdit?: (entry: LedgerEntry) => void;
  onAdjust?: (entry: LedgerEntry) => void;
  onRemove?: (entry: LedgerEntry) => void;
}

const iconButtonClasses =
  "inline-grid size-7 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-neutral-500 hover:bg-ink/7 hover:text-ink";

function CategoryTag({ entry }: { entry: LedgerEntry }) {
  if (entry.source === "CARD_PAYMENT") return <Tag variant="outline">Card bill</Tag>;
  if (!entry.category) return null;
  const variant =
    entry.kind === "INCOME" ? "accent" : entry.kind === "SAVINGS" ? "accent-2" : "neutral";
  return (
    <Tag variant={variant}>
      {entry.category.name}
      {entry.category.deleted && " (removed)"}
    </Tag>
  );
}

export function LedgerTable({ entries, emptyMessage, onEdit, onAdjust, onRemove }: LedgerTableProps) {
  const { t } = useI18n();

  if (entries.length === 0) {
    return <p className="py-5.5 text-[13px] text-ink/55">{emptyMessage}</p>;
  }

  const hasActions = Boolean(onEdit || onAdjust || onRemove);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          <Th className="w-14">Date</Th>
          <Th>Description</Th>
          <Th>Category</Th>
          <Th>Paid with</Th>
          <Th className="text-right">Amount</Th>
          {hasActions && <Th className="w-px" />}
        </TableHead>
        <TableBody>
          {entries.map((entry) => {
            const amount = signedAmount(entry);
            const detail = entryDetail(entry);
            return (
              <TableRow key={entry.key} className={cn(entry.projected && "opacity-65")}>
                <Td className="text-[12.5px] tabular-nums text-ink/55">{formatDayMonth(entry.date)}</Td>
                <Td>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5">
                      {entryTitle(entry)}
                      {entry.source === "RECURRING" && (
                        <span className="rounded border border-accent/50 px-1.5 text-[10px] leading-4 text-accent">
                          {entry.projected ? "Projection" : "Automatic"}
                        </span>
                      )}
                    </span>
                    {detail && <span className="text-[11.5px] text-ink/50">{detail}</span>}
                  </div>
                </Td>
                <Td>
                  <CategoryTag entry={entry} />
                </Td>
                <Td className="text-[12.5px] text-ink/60">{paidWithLabel(entry, t)}</Td>
                <Td
                  className={cn(
                    "text-right whitespace-nowrap tabular-nums",
                    amount > 0 ? "text-accent-400" : "text-ink",
                  )}
                >
                  {formatSignedMoney(amount)}
                </Td>
                {hasActions && (
                  <Td className="text-right whitespace-nowrap">
                    {entry.source === "TRANSACTION" && onEdit && (
                      <button
                        type="button"
                        aria-label={`Edit ${entryTitle(entry)}`}
                        className={iconButtonClasses}
                        onClick={() => onEdit(entry)}
                      >
                        <PencilSimple size={14} />
                      </button>
                    )}
                    {entry.source === "RECURRING" && onAdjust && (
                      <button
                        type="button"
                        className="cursor-pointer rounded-md border-0 bg-transparent px-2 py-1 text-[12px] text-accent hover:bg-accent/10"
                        onClick={() => onAdjust(entry)}
                      >
                        Log actual
                      </button>
                    )}
                    {entry.source !== "RECURRING" && onRemove && (
                      <button
                        type="button"
                        aria-label={`Delete ${entryTitle(entry)}`}
                        className={iconButtonClasses}
                        onClick={() => onRemove(entry)}
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
