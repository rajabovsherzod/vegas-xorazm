"use client";

import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Package,
  Calendar,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Eye,
  XCircle,
  Printer,
  Check,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/api";

interface OrderCardProps {
  order: Order;
  variant?: "admin" | "seller";
  showActions?: boolean;
  onView?: (order: Order) => void;
  onConfirm?: (order: Order) => void; // 🔥 ID emas, Order obyekti
  onCancel?: (order: Order) => void;  // 🔥 ID emas, Order obyekti
  onPrint?: (order: Order) => void;
  onEdit?: (order: Order) => void;    // Yangi qo'shildi (Admin uchun)
}

const paymentMethodMap: Record<string, { label: string; icon: any }> = {
  cash: { label: "Naqd", icon: Banknote },
  card: { label: "Karta", icon: CreditCard },
  transfer: { label: "O'tkazma", icon: Building2 },
  debt: { label: "Nasiya", icon: Receipt },
};

export function OrderCard({
  order,
  variant = "admin",
  showActions = true,
  onView,
  onConfirm,
  onCancel,
  onPrint,
  onEdit,
}: OrderCardProps) {
  const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap.cash;
  const PaymentIcon = payment.icon;
  
  const isDraft = order.status === "draft";
  const isCompleted = order.status === "completed";
  const isCancelled = order.status === "cancelled";

  // Status Badge Styles
  const statusStyles: any = {
    draft: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
    fully_refunded: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    partially_refunded: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  };

  const statusLabels: any = {
    draft: "Kutilmoqda",
    completed: "Yakunlandi",
    cancelled: "Bekor qilindi",
    fully_refunded: "Qaytarildi",
    partially_refunded: "Qism. qaytarildi",
  };

  // 🔥 VALYUTA LOGIKASI (TUZATILDI)
  // Agar order ichida USD mahsulot bo'lsa, jami USD summani hisoblaymiz
  const totalUSD = order.items?.reduce((sum, item) => {
    if (item.product?.currency === 'USD') {
        // Bazada narx UZS da. Uni USD ga qaytaramiz.
        const usdPrice = Number(item.price) / Number(order.exchangeRate);
        return sum + (usdPrice * Number(item.quantity));
    }
    return sum;
  }, 0) || 0;

  return (
    <div className="group bg-white dark:bg-[#132326] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
      <div className="p-4 flex-1">
        
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-[#00B8D9]/10 text-[#00B8D9]">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-[#212B36] dark:text-white">
                  #{order.id}
                </span>
                <Badge
                  variant="outline"
                  className={cn("px-2 py-0.5 text-[10px] font-bold border", statusStyles[order.status] || statusStyles.draft)}
                >
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(order.createdAt), "dd MMM, HH:mm")}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-end">
              {/* USD Summa (Agar bo'lsa) */}
              {totalUSD > 0 && (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  <TrendingUp className="w-3 h-3" />
                  ${totalUSD.toFixed(2)}
                </div>
              )}
              {/* UZS Summa (Katta) */}
              <span className="text-lg font-extrabold text-[#00B8D9]">
                {formatCurrency(Number(order.finalAmount), "UZS")}
              </span>
            </div>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-3" />

        {/* INFO GRID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Mijoz
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{order.customerName || "Noma'lum"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              To'lov
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white capitalize">
              <PaymentIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{payment.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS FOOTER */}
      {showActions && (
        <div className="p-3 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 mt-auto">
          <div className="flex gap-2">
            
            {/* View (Hamma uchun) */}
            {onView && (
              <Button
                variant="ghost"
                className="flex-1 h-10 text-muted-foreground hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 font-bold rounded-xl"
                onClick={() => onView(order)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ko'rish
              </Button>
            )}

            {/* Admin Actions (Tasdiqlash/Bekor qilish) */}
            {variant === "admin" && isDraft && (
              <>
                {onConfirm && (
                  <Button
                    className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all active:scale-95 rounded-xl"
                    onClick={() => onConfirm(order)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Tasdiqlash
                  </Button>
                )}
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                    onClick={() => onCancel(order)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}

            {/* Print (Completed bo'lsa) */}
            {(isCompleted || order.status.includes('refunded')) && onPrint && (
              <Button
                variant="outline"
                className="flex-1 h-10 font-bold rounded-xl border-gray-200 dark:border-white/10"
                onClick={() => onPrint(order)}
              >
                <Printer className="w-4 h-4 mr-2" />
                Chek
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
