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
  Printer,
  Check,
  XCircle,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Pencil,
  Tag,
  TrendingDown
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const paymentMethodMap: Record<string, { label: string; icon: any }> = {
  cash: { label: "Naqd", icon: Banknote },
  card: { label: "Karta", icon: CreditCard },
  transfer: { label: "O'tkazma", icon: Building2 },
  debt: { label: "Nasiya", icon: Receipt },
};

interface ColumnsProps {
  onView: (order: Order) => void;
  onPrint: (order: Order) => void;
  onEdit: (order: Order) => void;
  onConfirm: (order: Order) => void;
  onCancel: (order: Order) => void;
}

export const getColumns = ({ onView, onPrint, onEdit, onConfirm, onCancel }: ColumnsProps): ColumnDef<Order>[] => [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <span className="font-bold">#{row.original.id}</span>,
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
    cell: ({ row }) => {
      // 🔥 BETON MANTIQ:
      const totalAmount = Number(row.original.totalAmount); // Asl narxlar (Chegirmasiz)
      const finalAmount = Number(row.original.finalAmount); // To'langan (Hamma chegirmalar ayirilgan)
      
      // Farqi = Jami Chegirma (Aksiya + Manual + Global)
      const totalSaved = totalAmount - finalAmount;

      return (
        <div className="flex flex-col items-start">
          <div className="font-bold text-[#00B8D9]">
            {formatCurrency(finalAmount, "UZS")}
          </div>
          
          {/* Agar farq bo'lsa, demak qanaqadir chegirma bo'lgan */}
          {totalSaved > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md mt-1">
              <TrendingDown className="w-3 h-3" />
              -{formatCurrency(totalSaved, "UZS")}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      
      const statusStyles: any = {
        draft: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400",
        completed: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400",
        cancelled: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400",
        fully_refunded: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
        partially_refunded: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
      };

      const statusLabels: any = {
        draft: "Kutilmoqda",
        completed: "Yakunlandi",
        cancelled: "Bekor qilindi",
        fully_refunded: "Qaytarildi",
        partially_refunded: "Qism. qaytarildi",
      };

      return (
        <Badge variant="outline" className={cn(
          "px-2.5 py-0.5 text-[10px] font-bold border",
          statusStyles[status] || statusStyles.draft
        )}>
          {statusLabels[status] || status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const isDraft = order.status === "draft";
      const isCompleted = order.status === "completed";

      return (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-[#00B8D9] hover:bg-[#00B8D9]/10"
            onClick={() => onView(order)}
            title="Batafsil"
          >
            <Eye className="w-4 h-4" />
          </Button>

          {(isCompleted || order.status.includes('refunded')) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-[#212B36] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              onClick={() => onPrint(order)}
              title="Chekni chop etish"
            >
              <Printer className="w-4 h-4" />
            </Button>
          )}

          {isDraft && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 shadow-xl z-[9999]">
                <DropdownMenuLabel>Amallar</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => onEdit(order)}
                  className="text-[#00B8D9] focus:text-[#00B8D9] focus:bg-[#00B8D9]/10 cursor-pointer"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Tahrir qilish
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => onConfirm(order)}
                  className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-900/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Tasdiqlash
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => onCancel(order)}
                  className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20 cursor-pointer"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Bekor qilish
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    },
  },
];