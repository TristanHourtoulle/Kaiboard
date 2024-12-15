"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";

import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  deleteTeamRoles: (ids: string[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  deleteTeamRoles,
}: DataTableProps<TData, TValue> & {
  deleteTeamRoles: (ids: string[]) => void;
}) {
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });

  const handleDeleteSelected = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row: any) => row.original.id);
    if (selectedIds.length > 0) {
      deleteTeamRoles(selectedIds);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-start gap-2">
        <Button
          variant="destructive"
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          onClick={handleDeleteSelected}
        >
          Delete <span>{table.getFilteredSelectedRowModel().rows.length}</span>{" "}
          {table.getFilteredSelectedRowModel().rows.length > 1
            ? "roles"
            : "role"}
        </Button>
      </div>
      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
