"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Package,
  CalendarDays,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Eye,
  XCircle,
  Printer,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/api";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/constants";

/**
 * Order Card Component
 * 
 * Reusable order card for Admin and Seller pages.
 * Supports different variants and actions.
 */

interface OrderCardProps {
  order: Order;
  variant?: "admin" | "seller";
  showActions?: boolean;
  onView?: (order: Order) => void;
  onConfirm?: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
  onPrint?: (order: Order) => void;
}

const paymentMethodMap = {
  [PAYMENT_METHOD.CASH]: { label: "Naqd", icon: Banknote },
  [PAYMENT_METHOD.CARD]: { label: "Karta", icon: CreditCard },
  [PAYMENT_METHOD.TRANSFER]: { label: "O'tkazma", icon: Building2 },
  [PAYMENT_METHOD.DEBT]: { label: "Nasiya", icon: Receipt },
};

export function OrderCard({
  order,
  variant = "admin",
  showActions = true,
  onView,
  onConfirm,
  onCancel,
  onPrint,
}: OrderCardProps) {
  const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap[PAYMENT_METHOD.CASH];
  const PaymentIcon = payment.icon;
  const isDraft = order.status === ORDER_STATUS.DRAFT;
  const isCompleted = order.status === ORDER_STATUS.COMPLETED;
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  
  // USD calculation
  const hasUSDItems = order.items?.some(item => item.originalCurrency === 'USD');
  const totalUSDAmount = hasUSDItems 
    ? order.items?.reduce((sum, item) => 
        sum + (Number(item.price) / Number(order.exchangeRate)) * Number(item.quantity), 0
      ) 
    : 0;

  return (
    <div className="group bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all hover:border-gray-300 dark:hover:shadow-md flex flex-col">
      <div className="p-4 flex-1">
        {/* Header Info */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <Package className="w-5 h-5 text-[#00B8D9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-extrabold text-[#212B36] dark:text-white tracking-tight">
                  #{order.id}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold border-0",
                    isDraft && "bg-[#00B8D9]/10 text-[#00B8D9] dark:bg-[#00B8D9]/20",
                    isCompleted && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    isCancelled && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  {isDraft ? "Kutilmoqda" : isCompleted ? "Yakunlandi" : "Bekor qilindi"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                {format(new Date(order.createdAt), "dd MMMM, HH:mm")}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-end">
              {hasUSDItems && (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  ${new Intl.NumberFormat("en-US").format(totalUSDAmount)}
                </span>
              )}
              <span className="text-lg font-extrabold text-[#00B8D9]">
                {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                UZS
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-100 dark:bg-white/5" />

        {/* Middle Info */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Mijoz
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{order.customerName || "Mijoz"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              To'lov
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <PaymentIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{payment.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      {showActions && (
        <div className="p-3 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 mt-auto">
          <div className="flex gap-2">
            {/* View Button (Always Visible) */}
            {onView && (
              <Button
                variant="ghost"
                className="flex-1 h-10 text-muted-foreground hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 dark:hover:bg-white/5 font-bold rounded-xl"
                onClick={() => onView(order)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ko'rish
              </Button>
            )}

            {/* Admin Actions - Pending Orders */}
            {variant === "admin" && isDraft && (
              <>
                {onConfirm && (
                  <Button
                    className="flex-1 h-10 bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white font-bold shadow-lg shadow-[#00B8D9]/25 transition-all active:scale-95 rounded-xl"
                    onClick={() => onConfirm(order.id)}
                  >
                    Tasdiqlash
                  </Button>
                )}
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                    onClick={() => onCancel(order.id)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}

            {/* Seller Actions - Completed Orders */}
            {variant === "seller" && isCompleted && onPrint && (
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => onPrint(order)}
              >
                <Printer className="w-4 h-4 mr-1" />
                Chek
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}








import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Package,
  CalendarDays,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Eye,
  XCircle,
  Printer,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/api";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/constants";

/**
 * Order Card Component
 * 
 * Reusable order card for Admin and Seller pages.
 * Supports different variants and actions.
 */

interface OrderCardProps {
  order: Order;
  variant?: "admin" | "seller";
  showActions?: boolean;
  onView?: (order: Order) => void;
  onConfirm?: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
  onPrint?: (order: Order) => void;
}

const paymentMethodMap = {
  [PAYMENT_METHOD.CASH]: { label: "Naqd", icon: Banknote },
  [PAYMENT_METHOD.CARD]: { label: "Karta", icon: CreditCard },
  [PAYMENT_METHOD.TRANSFER]: { label: "O'tkazma", icon: Building2 },
  [PAYMENT_METHOD.DEBT]: { label: "Nasiya", icon: Receipt },
};

export function OrderCard({
  order,
  variant = "admin",
  showActions = true,
  onView,
  onConfirm,
  onCancel,
  onPrint,
}: OrderCardProps) {
  const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap[PAYMENT_METHOD.CASH];
  const PaymentIcon = payment.icon;
  const isDraft = order.status === ORDER_STATUS.DRAFT;
  const isCompleted = order.status === ORDER_STATUS.COMPLETED;
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  
  // USD calculation
  const hasUSDItems = order.items?.some(item => item.originalCurrency === 'USD');
  const totalUSDAmount = hasUSDItems 
    ? order.items?.reduce((sum, item) => 
        sum + (Number(item.price) / Number(order.exchangeRate)) * Number(item.quantity), 0
      ) 
    : 0;

  return (
    <div className="group bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all hover:border-gray-300 dark:hover:shadow-md flex flex-col">
      <div className="p-4 flex-1">
        {/* Header Info */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <Package className="w-5 h-5 text-[#00B8D9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-extrabold text-[#212B36] dark:text-white tracking-tight">
                  #{order.id}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold border-0",
                    isDraft && "bg-[#00B8D9]/10 text-[#00B8D9] dark:bg-[#00B8D9]/20",
                    isCompleted && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    isCancelled && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  {isDraft ? "Kutilmoqda" : isCompleted ? "Yakunlandi" : "Bekor qilindi"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                {format(new Date(order.createdAt), "dd MMMM, HH:mm")}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-end">
              {hasUSDItems && (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  ${new Intl.NumberFormat("en-US").format(totalUSDAmount)}
                </span>
              )}
              <span className="text-lg font-extrabold text-[#00B8D9]">
                {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                UZS
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-100 dark:bg-white/5" />

        {/* Middle Info */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Mijoz
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{order.customerName || "Mijoz"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              To'lov
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <PaymentIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{payment.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      {showActions && (
        <div className="p-3 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 mt-auto">
          <div className="flex gap-2">
            {/* View Button (Always Visible) */}
            {onView && (
              <Button
                variant="ghost"
                className="flex-1 h-10 text-muted-foreground hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 dark:hover:bg-white/5 font-bold rounded-xl"
                onClick={() => onView(order)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ko'rish
              </Button>
            )}

            {/* Admin Actions - Pending Orders */}
            {variant === "admin" && isDraft && (
              <>
                {onConfirm && (
                  <Button
                    className="flex-1 h-10 bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white font-bold shadow-lg shadow-[#00B8D9]/25 transition-all active:scale-95 rounded-xl"
                    onClick={() => onConfirm(order.id)}
                  >
                    Tasdiqlash
                  </Button>
                )}
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                    onClick={() => onCancel(order.id)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}

            {/* Seller Actions - Completed Orders */}
            {variant === "seller" && isCompleted && onPrint && (
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => onPrint(order)}
              >
                <Printer className="w-4 h-4 mr-1" />
                Chek
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}









import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Package,
  CalendarDays,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Eye,
  XCircle,
  Printer,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/api";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/constants";

/**
 * Order Card Component
 * 
 * Reusable order card for Admin and Seller pages.
 * Supports different variants and actions.
 */

interface OrderCardProps {
  order: Order;
  variant?: "admin" | "seller";
  showActions?: boolean;
  onView?: (order: Order) => void;
  onConfirm?: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
  onPrint?: (order: Order) => void;
}

const paymentMethodMap = {
  [PAYMENT_METHOD.CASH]: { label: "Naqd", icon: Banknote },
  [PAYMENT_METHOD.CARD]: { label: "Karta", icon: CreditCard },
  [PAYMENT_METHOD.TRANSFER]: { label: "O'tkazma", icon: Building2 },
  [PAYMENT_METHOD.DEBT]: { label: "Nasiya", icon: Receipt },
};

export function OrderCard({
  order,
  variant = "admin",
  showActions = true,
  onView,
  onConfirm,
  onCancel,
  onPrint,
}: OrderCardProps) {
  const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap[PAYMENT_METHOD.CASH];
  const PaymentIcon = payment.icon;
  const isDraft = order.status === ORDER_STATUS.DRAFT;
  const isCompleted = order.status === ORDER_STATUS.COMPLETED;
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  
  // USD calculation
  const hasUSDItems = order.items?.some(item => item.originalCurrency === 'USD');
  const totalUSDAmount = hasUSDItems 
    ? order.items?.reduce((sum, item) => 
        sum + (Number(item.price) / Number(order.exchangeRate)) * Number(item.quantity), 0
      ) 
    : 0;

  return (
    <div className="group bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all hover:border-gray-300 dark:hover:shadow-md flex flex-col">
      <div className="p-4 flex-1">
        {/* Header Info */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <Package className="w-5 h-5 text-[#00B8D9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-extrabold text-[#212B36] dark:text-white tracking-tight">
                  #{order.id}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold border-0",
                    isDraft && "bg-[#00B8D9]/10 text-[#00B8D9] dark:bg-[#00B8D9]/20",
                    isCompleted && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    isCancelled && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  {isDraft ? "Kutilmoqda" : isCompleted ? "Yakunlandi" : "Bekor qilindi"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                {format(new Date(order.createdAt), "dd MMMM, HH:mm")}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-end">
              {hasUSDItems && (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  ${new Intl.NumberFormat("en-US").format(totalUSDAmount)}
                </span>
              )}
              <span className="text-lg font-extrabold text-[#00B8D9]">
                {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                UZS
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-100 dark:bg-white/5" />

        {/* Middle Info */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Mijoz
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{order.customerName || "Mijoz"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              To'lov
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <PaymentIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{payment.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      {showActions && (
        <div className="p-3 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 mt-auto">
          <div className="flex gap-2">
            {/* View Button (Always Visible) */}
            {onView && (
              <Button
                variant="ghost"
                className="flex-1 h-10 text-muted-foreground hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 dark:hover:bg-white/5 font-bold rounded-xl"
                onClick={() => onView(order)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ko'rish
              </Button>
            )}

            {/* Admin Actions - Pending Orders */}
            {variant === "admin" && isDraft && (
              <>
                {onConfirm && (
                  <Button
                    className="flex-1 h-10 bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white font-bold shadow-lg shadow-[#00B8D9]/25 transition-all active:scale-95 rounded-xl"
                    onClick={() => onConfirm(order.id)}
                  >
                    Tasdiqlash
                  </Button>
                )}
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                    onClick={() => onCancel(order.id)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}

            {/* Seller Actions - Completed Orders */}
            {variant === "seller" && isCompleted && onPrint && (
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => onPrint(order)}
              >
                <Printer className="w-4 h-4 mr-1" />
                Chek
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}








import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Package,
  CalendarDays,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Eye,
  XCircle,
  Printer,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/types/api";
import { ORDER_STATUS, PAYMENT_METHOD } from "@/lib/constants";

/**
 * Order Card Component
 * 
 * Reusable order card for Admin and Seller pages.
 * Supports different variants and actions.
 */

interface OrderCardProps {
  order: Order;
  variant?: "admin" | "seller";
  showActions?: boolean;
  onView?: (order: Order) => void;
  onConfirm?: (orderId: number) => void;
  onCancel?: (orderId: number) => void;
  onPrint?: (order: Order) => void;
}

const paymentMethodMap = {
  [PAYMENT_METHOD.CASH]: { label: "Naqd", icon: Banknote },
  [PAYMENT_METHOD.CARD]: { label: "Karta", icon: CreditCard },
  [PAYMENT_METHOD.TRANSFER]: { label: "O'tkazma", icon: Building2 },
  [PAYMENT_METHOD.DEBT]: { label: "Nasiya", icon: Receipt },
};

export function OrderCard({
  order,
  variant = "admin",
  showActions = true,
  onView,
  onConfirm,
  onCancel,
  onPrint,
}: OrderCardProps) {
  const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap[PAYMENT_METHOD.CASH];
  const PaymentIcon = payment.icon;
  const isDraft = order.status === ORDER_STATUS.DRAFT;
  const isCompleted = order.status === ORDER_STATUS.COMPLETED;
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  
  // USD calculation
  const hasUSDItems = order.items?.some(item => item.originalCurrency === 'USD');
  const totalUSDAmount = hasUSDItems 
    ? order.items?.reduce((sum, item) => 
        sum + (Number(item.price) / Number(order.exchangeRate)) * Number(item.quantity), 0
      ) 
    : 0;

  return (
    <div className="group bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all hover:border-gray-300 dark:hover:shadow-md flex flex-col">
      <div className="p-4 flex-1">
        {/* Header Info */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
              <Package className="w-5 h-5 text-[#00B8D9]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-extrabold text-[#212B36] dark:text-white tracking-tight">
                  #{order.id}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold border-0",
                    isDraft && "bg-[#00B8D9]/10 text-[#00B8D9] dark:bg-[#00B8D9]/20",
                    isCompleted && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                    isCancelled && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  )}
                >
                  {isDraft ? "Kutilmoqda" : isCompleted ? "Yakunlandi" : "Bekor qilindi"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CalendarDays className="w-3.5 h-3.5" />
                {format(new Date(order.createdAt), "dd MMMM, HH:mm")}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex flex-col items-end">
              {hasUSDItems && (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                  ${new Intl.NumberFormat("en-US").format(totalUSDAmount)}
                </span>
              )}
              <span className="text-lg font-extrabold text-[#00B8D9]">
                {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                UZS
              </span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gray-100 dark:bg-white/5" />

        {/* Middle Info */}
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Mijoz
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{order.customerName || "Mijoz"}</span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              To'lov
            </p>
            <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
              <PaymentIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{payment.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      {showActions && (
        <div className="p-3 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 mt-auto">
          <div className="flex gap-2">
            {/* View Button (Always Visible) */}
            {onView && (
              <Button
                variant="ghost"
                className="flex-1 h-10 text-muted-foreground hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 dark:hover:bg-white/5 font-bold rounded-xl"
                onClick={() => onView(order)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ko'rish
              </Button>
            )}

            {/* Admin Actions - Pending Orders */}
            {variant === "admin" && isDraft && (
              <>
                {onConfirm && (
                  <Button
                    className="flex-1 h-10 bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white font-bold shadow-lg shadow-[#00B8D9]/25 transition-all active:scale-95 rounded-xl"
                    onClick={() => onConfirm(order.id)}
                  >
                    Tasdiqlash
                  </Button>
                )}
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl"
                    onClick={() => onCancel(order.id)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}

            {/* Seller Actions - Completed Orders */}
            {variant === "seller" && isCompleted && onPrint && (
              <Button
                variant="outline"
                size="sm"
                className="h-10"
                onClick={() => onPrint(order)}
              >
                <Printer className="w-4 h-4 mr-1" />
                Chek
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}









