"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Layers, MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import type { Category } from "@/types/api"

// Re-export for backward compatibility
export type { Category };

export function getColumns(
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void
): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">#{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name",
      header: "Kategoriya",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-[#212B36] dark:text-white">
                {row.getValue("name")}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Tavsif",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
            {row.getValue("description") || "-"}
          </span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Yaratilgan sana",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"))
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {format(date, "dd.MM.yyyy")}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 shadow-xl rounded-xl z-[9999]">
              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => onEdit(category)}
                className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/10 rounded-lg"
              >
                <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category)}
                className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 rounded-lg"
              >
                <Trash2 className="mr-2 h-4 w-4" /> O'chirish
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}


