import type { ReactNode } from "react";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type Column<T> = { header: string; cell: (row: T) => ReactNode; className?: string };

/** Lightweight horizontally-scrollable table used across admin screens. */
export function SimpleTable<T>({ columns, rows, rowKey }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c, i) => (
              <TableHead key={c.header} className={i === 0 ? "pl-5" : i === columns.length - 1 ? "pr-5" : undefined}>
                {c.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((c, i) => (
                <TableCell
                  key={c.header}
                  className={[i === 0 ? "pl-5" : "", i === columns.length - 1 ? "pr-5" : "", "whitespace-nowrap", c.className ?? ""].join(" ")}
                >
                  {c.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
