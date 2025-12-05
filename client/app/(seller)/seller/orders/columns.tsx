"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/types/api"; 
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface ColumnsProps {
  onEdit?: (order: Order) => void;
}

// Statuslar uchun ranglar va nomlar (O'ZBEKCHA)
const statusConfig: Record<string, { label: string; style: string }> = {
  draft: { 
    label: "Kutilmoqda", 
    style: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400" 
  },
  completed: { 
    label: "Yakunlandi", 
    style: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" 
  },
  cancelled: { 
    label: "Bekor qilindi", 
    style: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400" 
  },
};

export const getColumns = ({ onEdit }: ColumnsProps): ColumnDef<Order>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-bold text-[#212B36] dark:text-white">#{row.original.id}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Sana",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-medium">
        {format(new Date(row.original.createdAt), "dd.MM.yyyy HH:mm")}
      </span>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Mijoz",
    cell: ({ row }) => (
      <span className="font-medium text-[#212B36] dark:text-white">
        {row.original.customerName || "—"}
      </span>
    ),
  },
  {
    accessorKey: "finalAmount",
    header: "Summa",
    cell: ({ row }) => (
      <span className="font-bold text-[#00B8D9]">
        {formatCurrency(Number(row.original.finalAmount), "UZS")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Holat",
    cell: ({ row }) => {
      const status = row.original.status;
      const config = statusConfig[status] || statusConfig.draft;

      return (
        <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[10px] font-bold border", config.style)}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      
      // 🔥 BETON MANTIQ: Agar Draft bo'lmasa, HECH NARSA CHIQMAYDI (3 nuqta ham yo'q)
      if (order.status !== 'draft') {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-white/10">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Tahrirlash */}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(order)} className="cursor-pointer text-[#00B8D9] focus:text-[#00B8D9] focus:bg-[#00B8D9]/10">
                <Pencil className="w-4 h-4 mr-2" />
                Tahrirlash
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];