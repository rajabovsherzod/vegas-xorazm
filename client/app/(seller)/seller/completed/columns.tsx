"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Order } from "@/lib/services/order.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface ColumnsProps {
  onView?: (order: Order) => void;
  onEdit?: (order: Order) => void;
}

export function getColumns({ onView, onEdit }: ColumnsProps): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-semibold text-[#212B36] dark:text-white">
          #{row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Holat",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusMap: Record<string, { label: string; className: string }> = {
          draft: { label: "Kutilmoqda", className: "bg-amber-500 hover:bg-amber-600" },
          completed: { label: "Yakunlandi", className: "bg-emerald-500 hover:bg-emerald-600" },
          cancelled: { label: "Bekor qilindi", className: "bg-rose-500 hover:bg-rose-600" },
        };
        const statusInfo = statusMap[status] || statusMap.draft;
        return (
          <Badge className={statusInfo.className} variant="default">
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "Mijoz",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.customerName || "Noma'lum"}
        </span>
      ),
    },
    {
      accessorKey: "items",
      header: "Mahsulotlar",
      cell: ({ row }) => {
        const items = row.original.items || [];
        return (
          <span className="text-sm text-muted-foreground">
            {items.length} xil mahsulot
          </span>
        );
      },
    },
    {
      accessorKey: "finalAmount",
      header: "Jami",
      cell: ({ row }) => (
        <span className="font-semibold text-[#212B36] dark:text-white">
          {formatCurrency(Number(row.original.finalAmount), "UZS")}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Sana",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "dd.MM.yyyy HH:mm")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Amallar",
      cell: ({ row }) => {
        const order = row.original;
        const canEdit = order.status === "draft";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Amallar</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(order)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ko'rish
                </DropdownMenuItem>
              )}
              {canEdit && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(order)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Tahrir qilish
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}