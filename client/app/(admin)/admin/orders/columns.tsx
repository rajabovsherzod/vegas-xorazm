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
  RotateCcw,
  Eye,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

const paymentMethodMap: Record<string, { label: string; icon: any }> = {
  cash: { label: "Naqd", icon: Banknote },
  card: { label: "Karta", icon: CreditCard },
  transfer: { label: "O'tkazma", icon: Building2 },
  debt: { label: "Nasiya", icon: Receipt },
};

interface ColumnsProps {
  onView: (order: Order) => void;
  onRefund: (order: Order) => void; // 🔥 BITTA FUNKSIYA YETARLI
}

export const getColumns = ({ onView, onRefund }: ColumnsProps): ColumnDef<Order>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-bold text-[#212B36] dark:text-white">#{row.original.id}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Sana",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {format(new Date(row.original.createdAt), "dd MMM, yyyy")}
        </span>
        <span className="text-xs text-muted-foreground">
          {format(new Date(row.original.createdAt), "HH:mm")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Mijoz",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="font-medium truncate max-w-[120px]">
          {row.original.customerName || "—"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "To'lov",
    cell: ({ row }) => {
      const payment = paymentMethodMap[row.original.paymentMethod] || paymentMethodMap.cash;
      const PaymentIcon = payment.icon;
      return (
        <div className="flex items-center gap-2">
          <PaymentIcon className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium capitalize">
            {payment.label}
          </span>
        </div>
      );
    },
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
      
      const styles: any = {
        draft: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
        completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
        cancelled: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
        fully_refunded: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
        partially_refunded: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
      };

      const labels: any = {
        draft: "Kutilmoqda",
        completed: "Yakunlandi",
        cancelled: "Bekor qilindi",
        fully_refunded: "To'liq qaytarildi",
        partially_refunded: "Qisman qaytarildi",
      };

      return (
        <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[10px] font-bold border", styles[status])}>
          {labels[status] || status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      
      const canRefund = order.status === 'completed' || order.status === 'partially_refunded';

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-white/10">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="end" 
            className="w-[200px] bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 shadow-xl z-[9999]"
          >
            <DropdownMenuLabel>Amallar</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={() => onView(order)} 
              className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/5 py-2.5"
            >
              <Eye className="w-4 h-4 mr-2 opacity-70" />
              Ko'rish
            </DropdownMenuItem>

            {canRefund && (
              <>
                <DropdownMenuSeparator />
                
                {/* QAYTARISH (REFUND) */}
                <DropdownMenuItem 
                  onClick={() => onRefund(order)} 
                  className="cursor-pointer text-rose-600 dark:text-rose-500 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 py-2.5"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Qaytarish (Refund)
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];