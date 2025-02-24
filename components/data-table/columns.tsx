"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "./column-header"
import { DataTableRowActions } from "./row-actions"

export type BaseColumns = {
  id: string
  createdAt: string
}

export const baseColumns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created At" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]