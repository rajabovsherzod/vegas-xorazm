"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService, Order } from "@/lib/services/order.service";
import { useSocket } from "@/hooks/use-socket";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  Printer,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";

const statusMap: Record<string, { label: string; className: string; icon: any }> = {
  draft: { label: "Kutilmoqda", className: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400", icon: Clock },
  completed: { label: "Yakunlandi", className: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400", icon: CheckCircle },
  cancelled: { label: "Bekor qilindi", className: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400", icon: XCircle },
};

const paymentMethodMap: Record<string, { label: string; icon: any }> = {
  cash: { label: "Naqd", icon: Banknote },
  card: { label: "Karta", icon: CreditCard },
  transfer: { label: "O'tkazma", icon: Building2 },
  debt: { label: "Nasiya", icon: Receipt },
};

export default function SellerCompletedPage() {
  const queryClient = useQueryClient();

  // Socket - real-time yangilanishlar
  const handleOrderStatusChange = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
  }, [queryClient]);

  useSocket({
    onOrderStatusChange: handleOrderStatusChange,
  });

  // Buyurtmalar (Seller faqat o'zinikini ko'radi - backend filter qiladi)
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: () => orderService.getAll(),
  });

  // Faqat yakunlangan va bekor qilinganlar
  const completedOrders = orders.filter((order: Order) => order.status !== "draft");

  const OrderCard = ({ order }: { order: Order }) => {
    const status = statusMap[order.status] || statusMap.draft;
    const StatusIcon = status.icon;
    const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap.cash;
    const PaymentIcon = payment.icon;

    return (
      <div
        className={cn(
          "rounded-xl border bg-white dark:bg-[#132326] p-4 transition-all shadow-md",
          order.status === "completed"
            ? "border-emerald-200 dark:border-emerald-900/30"
            : "border-gray-200 dark:border-white/10"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center",
                order.status === "completed"
                  ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : order.status === "cancelled"
                    ? "bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
                    : "bg-gray-100 dark:bg-white/5 text-muted-foreground"
              )}
            >
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#212B36] dark:text-white">
                  #{order.id}
                </h4>
                <Badge variant="outline" className={status.className}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")}
                </span>
                <span className="flex items-center gap-1">
                  <PaymentIcon className="w-3 h-3" />
                  {payment.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xl font-extrabold text-[#212B36] dark:text-white">
                {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))}
                <span className="text-sm font-normal text-muted-foreground ml-1">UZS</span>
              </p>
              {order.customerName && (
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              )}
            </div>

            {order.status === "completed" && (
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-1" />
                Chek
              </Button>
            )}
          </div>
        </div>

        {/* Mahsulotlar */}
        {order.items && order.items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex flex-wrap gap-2">
              {order.items.slice(0, 3).map((item: any, index: number) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-muted-foreground"
                >
                  {item.product?.name || "Mahsulot"} x{item.quantity}
                </span>
              ))}
              {order.items.length > 3 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-muted-foreground">
                  +{order.items.length - 3} ta
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Yakunlangan Buyurtmalar"
        description="Tasdiqlangan va bekor qilingan buyurtmalar tarixi"
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : completedOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-gray-200 dark:border-white/10 text-muted-foreground">
          <FileText className="w-12 h-12 mb-3 opacity-50" />
          <p className="text-lg font-medium">Hozircha buyurtma yo'q</p>
          <p className="text-sm">Yangi buyurtma yaratish uchun Kassaga o'ting</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedOrders.map((order: Order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}


