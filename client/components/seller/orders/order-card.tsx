"use client";

import { Order } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { 
  MoreHorizontal, 
  Edit, 
  Eye,
  Calendar,
  Package,
  User,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  onEdit?: (order: Order) => void;
  onView?: (order: Order) => void;
  onDelete?: (order: Order) => void;
}

export function OrderCard({ order, onEdit, onView, onDelete }: OrderCardProps) {
  const isDraft = order.status === "draft";

  // Status ranglari
  const statusConfig: Record<string, { label: string; className: string }> = {
    draft: { 
      label: "Kutilmoqda", 
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400" 
    },
    completed: { 
      label: "Yakunlandi", 
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" 
    },
    cancelled: { 
      label: "Bekor", 
      className: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" 
    },
  };

  const statusInfo = statusConfig[order.status] || statusConfig.draft;

  return (
    <div className="group relative bg-white dark:bg-[#132326] rounded-2xl border border-gray-200 dark:border-white/5 p-4 shadow-sm transition-all duration-200 hover:border-[#00B8D9]/50 hover:shadow-md select-none">
      
      <div className="flex items-center justify-between gap-3">
        
        {/* --- 1. CHAP TOMON: ID, Status, Info --- */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
              #{order.id}
            </span>
            <Badge 
              variant="outline" 
              className={cn("px-2 py-0.5 text-[10px] font-semibold border uppercase tracking-wide rounded-md", statusInfo.className)}
            >
              {statusInfo.label}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md border border-gray-100 dark:border-white/5">
              <Calendar className="h-3.5 w-3.5 opacity-70" />
              {format(new Date(order.createdAt), "dd.MM HH:mm")}
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-md border border-gray-100 dark:border-white/5">
              <Package className="h-3.5 w-3.5 opacity-70" />
              {order.items?.length || 0} ta
            </div>
          </div>
        </div>

        {/* --- 2. O'RTA: Narx va Mijoz --- */}
        <div className="flex flex-col items-end justify-center gap-1 text-right">
          <span className="text-lg font-bold text-[#00B8D9] tracking-tight leading-none">
            {formatCurrency(Number(order.finalAmount), "UZS")}
          </span>
          
          <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[120px]">
            <span className="truncate">{order.customerName || "Mijoz yo'q"}</span>
            <User className="h-3.5 w-3.5 opacity-50 shrink-0" />
          </div>
        </div>

        {/* --- 3. O'NG: Action Button (FAQAT DRAFT BO'LSA CHIQADI) --- */}
        {isDraft && (
          <div className="pl-3 border-l border-gray-100 dark:border-white/5 ml-1">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-11 w-11 rounded-full bg-gray-50 dark:bg-white/5 text-gray-500 hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 transition-all active:scale-95 border border-transparent hover:border-[#00B8D9]/20"
                >
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-white dark:bg-[#1C2526] border-gray-200 dark:border-white/10 shadow-xl p-1 z-[50]"
              >
                {/* KO'RISH */}
                {onView && (
                  <DropdownMenuItem 
                    onClick={() => onView(order)} 
                    className="cursor-pointer py-2.5 px-3 rounded-lg focus:bg-gray-100 dark:focus:bg-[#00B8D9]/10 dark:focus:text-[#00B8D9] font-medium"
                  >
                    <Eye className="mr-2 h-4 w-4 opacity-70" /> 
                    Ko'rish
                  </DropdownMenuItem>
                )}

                {/* TAHRIRLASH */}
                <DropdownMenuItem 
                  onClick={() => onEdit?.(order)} 
                  className="cursor-pointer py-2.5 px-3 rounded-lg text-amber-600 dark:text-amber-500 focus:bg-amber-50 dark:focus:bg-amber-500/10 focus:text-amber-700 font-medium"
                >
                  <Edit className="mr-2 h-4 w-4" /> 
                  Tahrirlash
                </DropdownMenuItem>
                
                {/* O'CHIRISH */}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-white/5 my-1" />
                    <DropdownMenuItem 
                      onClick={() => onDelete(order)} 
                      className="cursor-pointer py-2.5 px-3 rounded-lg text-rose-600 dark:text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-700 font-medium"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> 
                      Bekor qilish
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

      </div>
    </div>
  );
}