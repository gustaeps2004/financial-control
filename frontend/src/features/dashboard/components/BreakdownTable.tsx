import type { ReactNode } from "react";
import { Table, TableBody, TableHead, TableRow, Td, Th } from "@/shared/ui/Table";
import { cn } from "@/shared/lib/cn";

export interface BreakdownColumn<Row> {
  header: string;
  align?: "right";
  render: (row: Row) => ReactNode;
}

interface BreakdownTableProps<Row> {
  rows: Row[];
  columns: BreakdownColumn<Row>[];
  rowKey: (row: Row) => string;
  emptyMessage: string;
  // A closing row, e.g. totals.
  footer?: ReactNode[];
}

export function BreakdownTable<Row>({
  rows,
  columns,
  rowKey,
  emptyMessage,
  footer,
}: BreakdownTableProps<Row>) {
  if (rows.length === 0) {
    return <p className="m-0 text-[12.5px] text-ink/55">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHead>
          {columns.map((column) => (
            <Th key={column.header} className={cn(column.align === "right" && "text-right")}>
              {column.header}
            </Th>
          ))}
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <Td
                  key={column.header}
                  className={cn(
                    "text-[13px]",
                    column.align === "right" && "text-right whitespace-nowrap tabular-nums",
                  )}
                >
                  {column.render(row)}
                </Td>
              ))}
            </TableRow>
          ))}
          {footer && (
            <TableRow>
              {footer.map((cell, index) => (
                <Td
                  key={columns[index]?.header ?? index}
                  className={cn(
                    "text-[13px] font-medium",
                    columns[index]?.align === "right" && "text-right whitespace-nowrap tabular-nums",
                  )}
                >
                  {cell}
                </Td>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
