"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Package, Layers, MoreHorizontal, Pencil, Trash2, TrendingUp, Percent, Tag } from "lucide-react" // Tag va Percent ikonkalari
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Product } from "@/types/api"

export type { Product };

export function getColumns(
  usdRate: number,
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
  onDiscount: (product: Product) => void // 🔥 YANGI: Chegirma funksiyasi
): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="text-xs text-muted-foreground">#{row.getValue("id")}</span>,
    },
    {
      accessorKey: "name",
      header: "Mahsulot",
      cell: ({ row }) => {
        // Agar chegirma bo'lsa, badge chiqaramiz
        const hasDiscount = Number(row.original.discountPrice) > 0;
        
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl relative">
              <Package className="w-5 h-5 text-[#00B8D9]" />
              {hasDiscount && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1 rounded-full animate-pulse">
                  %
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-[#212B36] dark:text-white line-clamp-1">
                {row.getValue("name")}
              </p>
              {hasDiscount && (
                <span className="text-[10px] text-amber-500 font-medium">Aksiya faol</span>
              )}
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
        const discountPrice = Number(row.original.discountPrice);
        const currency = row.original.currency
        const isUSD = currency === 'USD'
        const hasDiscount = discountPrice > 0;

        // Asl narx (UZS da)
        const originalUzs = isUSD ? price * usdRate : price;
        // Chegirma narx (UZS da)
        const discountUzs = isUSD ? discountPrice * usdRate : discountPrice;

        return (
          <div>
            {hasDiscount ? (
              <div className="flex flex-col">
                {/* Chegirma narxi (Katta va yorqin) */}
                <div className="font-bold text-amber-500 flex items-center gap-1">
                  {new Intl.NumberFormat("uz-UZ").format(discountUzs)}
                  <span className="text-xs font-normal">UZS</span>
                  <Tag className="w-3 h-3" />
                </div>
                {/* Eski narx (Chizilgan) */}
                <span className="text-xs text-muted-foreground line-through decoration-red-500/50">
                  {new Intl.NumberFormat("uz-UZ").format(originalUzs)}
                </span>
              </div>
            ) : (
              // Oddiy holat
              <div className="font-bold text-[#00B8D9]">
                {new Intl.NumberFormat("uz-UZ").format(originalUzs)}
                <span className="text-xs text-muted-foreground font-normal ml-1">
                  {isUSD ? 'UZS' : currency}
                </span>
              </div>
            )}
            
            {/* USD narxini kichik ko'rsatish (faqat USD bo'lsa) */}
            {isUSD && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                <TrendingUp className="w-3 h-3" />
                ${new Intl.NumberFormat("en-US").format(hasDiscount ? discountPrice : price)}
              </div>
            )}
          </div>
        )
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
            <DropdownMenuContent align="end" className="bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 shadow-xl rounded-xl z-[9999] w-48">
              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
              
              <DropdownMenuItem
                onClick={() => onEdit(product)}
                className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/10 rounded-lg py-2"
              >
                <Pencil className="mr-2 h-4 w-4 text-blue-500" /> Tahrirlash
              </DropdownMenuItem>

              {/* 🔥 YANGI: CHEGIRMA TUGMASI */}
              <DropdownMenuItem
                onClick={() => onDiscount(product)}
                className="cursor-pointer focus:bg-amber-50 dark:focus:bg-amber-900/20 rounded-lg py-2"
              >
                <Percent className="mr-2 h-4 w-4 text-amber-500" /> 
                Chegirma belgilash
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/10" />

              <DropdownMenuItem
                onClick={() => onDelete(product)}
                className="cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 rounded-lg py-2"
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