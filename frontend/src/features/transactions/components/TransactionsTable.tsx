import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { Tag } from "@/shared/ui/Tag";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/cn";
import { formatDateShort, formatDay, formatMoney, methodLabel } from "@/features/finance-data/lib/selectors";
import type { CardAccount } from "@/features/cards/types";
import type { Transaction } from "@/features/finance-data/types";

interface TransactionsTableProps {
  transactions: Transaction[];
  cards: CardAccount[];
  dateVariant: "day" | "full";
  onRemove?: (id: string) => void;
  emptyMessage: string;
}

export function TransactionsTable({
  transactions,
  cards,
  dateVariant,
  onRemove,
  emptyMessage,
}: TransactionsTableProps) {
  if (transactions.length === 0) {
    return <p className="py-5.5 text-[13px] text-ink/55">{emptyMessage}</p>;
  }

  return (
    <Table>
      <TableHead>
        <Th className={dateVariant === "day" ? "w-13" : "w-18"}>
          {dateVariant === "day" ? "Day" : "Date"}
        </Th>
        <Th>Description</Th>
        <Th>Category</Th>
        <Th>Method</Th>
        <Th className="text-right">Amount</Th>
        {onRemove && <Th className="w-px" />}
      </TableHead>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <Td className="text-[12.5px] tabular-nums text-ink/55">
              {dateVariant === "day" ? formatDay(t.day) : formatDateShort(t.day, t.month)}
            </Td>
            <Td>{t.desc}</Td>
            <Td>
              <Tag>{t.cat}</Tag>
            </Td>
            <Td className="text-[12.5px] text-ink/55">{methodLabel(t, cards)}</Td>
            <Td
              className={cn(
                "text-right tabular-nums",
                t.kind === "in" ? "text-accent-400" : "text-ink",
              )}
            >
              {t.kind === "in" ? "+" : "−"} {formatMoney(t.amount)}
            </Td>
            {onRemove && (
              <Td className="text-right">
                <Button variant="ghost" onClick={() => onRemove(t.id)}>
                  ×
                </Button>
              </Td>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
