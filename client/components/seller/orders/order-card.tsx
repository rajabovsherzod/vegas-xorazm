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
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
  onView?: (order: Order) => void;
}

export function OrderCard({ order, onEdit, onView }: OrderCardProps) {
  const isDraft = order.status === "draft";

  // Status ranglari (Professional va Toza)
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
    <div className="group relative bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/5 p-3.5 shadow-sm transition-all duration-200 hover:border-[#00B8D9]/50 hover:shadow-md select-none">
      
      <div className="flex items-start justify-between gap-3">
        
        {/* --- CHAP TOMON (ID, Status, Info) --- */}
        <div className="flex flex-col gap-2 min-w-0">
          
          {/* 1. ID va Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900 dark:text-white leading-none">
              #{order.id}
            </span>
            <Badge 
              variant="outline" 
              className={cn("px-1.5 py-0 text-[10px] h-5 font-semibold border uppercase tracking-wide", statusInfo.className)}
            >
              {statusInfo.label}
            </Badge>
          </div>

          {/* 2. Sana va Package (Kulrang, ixcham) */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 opacity-70" />
              {format(new Date(order.createdAt), "dd.MM HH:mm")}
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 opacity-70" />
              {order.items?.length || 0} ta
            </div>
          </div>
        </div>

        {/* --- O'NG TOMON (Narx, Action, Mijoz) --- */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          
          {/* 1. Narx va Action Button */}
          <div className="flex items-center gap-2">
            {/* NARX: Asosiy urg'u (Teal rangda) */}
            <span className="text-base font-bold text-[#00B8D9] tracking-tight">
              {formatCurrency(Number(order.finalAmount), "UZS")}
            </span>
            
            {/* ACTION BUTTON */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 -mr-2 text-gray-400 hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 transition-colors"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              
              {/* DROPDOWN CONTENT (To'g'rilangan ranglar) */}
              <DropdownMenuContent 
                align="end" 
                className="w-44 bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 shadow-xl"
              >
                {onView && (
                  <DropdownMenuItem 
                    onClick={() => onView(order)} 
                    className="cursor-pointer py-2 focus:bg-gray-100 dark:focus:bg-[#00B8D9]/10 dark:focus:text-[#00B8D9]"
                  >
                    <Eye className="mr-2 h-4 w-4 opacity-70" /> 
                    Ko'rish
                  </DropdownMenuItem>
                )}
                {isDraft && (
                  <DropdownMenuItem 
                    onClick={() => onEdit(order)} 
                    className="cursor-pointer py-2 text-amber-600 dark:text-amber-500 focus:bg-amber-50 dark:focus:bg-amber-500/10 focus:text-amber-700"
                  >
                    <Edit className="mr-2 h-4 w-4" /> 
                    Tahrirlash
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 2. Mijoz Ismi (Kichikroq va o'ngga taqalgan) */}
          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 max-w-[140px] truncate">
            <User className="h-3 w-3 opacity-50" />
            <span className="truncate">{order.customerName || "Mijoz yo'q"}</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}