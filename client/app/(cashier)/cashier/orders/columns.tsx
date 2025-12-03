"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/lib/services/order.service";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        <span className="font-medium">
          {row.original.customerName || "Mijoz"}
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
      <div className="font-bold text-[#00B8D9]">
        {new Intl.NumberFormat("uz-UZ").format(Number(row.original.finalAmount))} UZS
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isDraft = status === "draft";
      return (
        <Badge variant="outline" className={cn(
          "px-2.5 py-0.5 text-[10px] font-bold border-0",
          isDraft
            ? "bg-[#00B8D9]/10 text-[#00B8D9] dark:bg-[#00B8D9]/20"
            : status === "completed"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
        )}>
          {isDraft ? "Kutilmoqda" : status === "completed" ? "Yakunlandi" : "Bekor qilindi"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const isDraft = order.status === "draft";

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

          {!isDraft && order.status !== 'cancelled' && (
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
              <DropdownMenuContent align="end" className="w-[160px] bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10">
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


