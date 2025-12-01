"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Package, Layers, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Product = {
  id: number
  name: string
  price: number
  currency: string
  originalPrice?: number
  stock: number
  unit: string
  categoryId: number | null
  category?: { name: string }
  createdAt: string
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="text-xs text-muted-foreground">#{row.getValue("id")}</span>,
  },
  {
    accessorKey: "name",
    header: "Mahsulot",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl">
             <Package className="w-5 h-5 text-[#00B8D9]" />
          </div>
          <div>
            <p className="font-bold text-[#212B36] dark:text-white line-clamp-1">
              {row.getValue("name")}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "category",
    header: "Kategoriya",
    cell: ({ row }) => {
      const category = row.original.category?.name || "Kategoriyasiz";
      return (
        <div className="flex items-center gap-2">
           <Layers className="w-3.5 h-3.5 text-muted-foreground" />
           <span className="text-sm text-muted-foreground">{category}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Narx",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("uz-UZ").format(price)
      const currency = row.original.currency
 
      return <div className="font-bold text-[#00B8D9]">{formatted} <span className="text-xs text-muted-foreground font-normal">{currency}</span></div>
    },
  },
  {
    accessorKey: "stock",
    header: "Omborda",
    cell: ({ row }) => {
      const stock = parseFloat(row.getValue("stock"))
      const unit = row.original.unit
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30 font-bold">
           {stock} {unit}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original
 
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
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/10 rounded-lg">
               <Pencil className="mr-2 h-4 w-4" /> Tahrirlash
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 rounded-lg">
               <Trash2 className="mr-2 h-4 w-4" /> O'chirish
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

