"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, Order } from "@/lib/services/order.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  User,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  CalendarDays,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";

const paymentMethodMap: Record<string, { label: string; icon: any }> = {
  cash: { label: "Naqd", icon: Banknote },
  card: { label: "Karta", icon: CreditCard },
  transfer: { label: "O'tkazma", icon: Building2 },
  debt: { label: "Nasiya", icon: Receipt },
};

type TabType = "pending" | "completed";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getAll(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: "completed" | "cancelled" }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  const pendingOrders = orders.filter((order: Order) => order.status === "draft");
  const processedOrders = orders.filter((order: Order) => order.status !== "draft");

  const handleConfirm = (orderId: number) => {
    updateStatusMutation.mutate({ orderId, status: "completed" });
  };

  const handleCancel = (orderId: number) => {
    updateStatusMutation.mutate({ orderId, status: "cancelled" });
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap.cash;
    const PaymentIcon = payment.icon;
    const isDraft = order.status === "draft";

    return (
      <div className="group bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden transition-all hover:border-gray-300 dark:hover:border-white/20 hover:shadow-sm flex flex-col">
        <div className="p-5 flex-1">
          {/* Header Info */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                isDraft 
                  ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400"
                  : order.status === "completed"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400"
                    : "bg-gray-50 border-gray-100 text-gray-500 dark:bg-gray-900/30 dark:border-gray-800 dark:text-gray-400"
              )}>
                {isDraft ? <Clock className="w-5 h-5" /> : 
                 order.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-lg font-bold text-[#212B36] dark:text-white">#{order.id}</span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <CalendarDays className="w-3 h-3" />
                  {format(new Date(order.createdAt), "dd.MM HH:mm")}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <span className="block text-xl font-bold text-[#212B36] dark:text-white tracking-tight">
                {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))}
              </span>
              <span className="text-xs font-medium text-muted-foreground">UZS</span>
            </div>
          </div>

          {/* Middle Info */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Mijoz</p>
              <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="truncate">{order.customerName || "Mijoz"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">To'lov</p>
              <div className="flex items-center gap-1.5 font-medium text-sm text-[#212B36] dark:text-white">
                <PaymentIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{payment.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 mt-auto">
          <div className="flex gap-3">
            {/* Details Button (Always Visible) */}
            <Button 
              variant="outline" 
              className="flex-1 border-gray-200 dark:border-white/10 dark:bg-transparent dark:hover:bg-white/5"
              onClick={() => handleViewDetails(order)}
            >
              <Eye className="w-4 h-4 mr-2" />
              Ko'rish
            </Button>

            {/* Action Buttons (Only for Pending) */}
            {isDraft && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="flex-1 bg-[#212B36] hover:bg-[#212B36]/90 dark:bg-white dark:text-[#212B36] dark:hover:bg-white/90 font-bold">
                      Tasdiqlash
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Buyurtmani tasdiqlash</AlertDialogTitle>
                      <AlertDialogDescription>
                        Buyurtma #{order.id} tasdiqlanadi. Davom etasizmi?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleConfirm(order.id)} className="bg-emerald-600 hover:bg-emerald-700">Tasdiqlash</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Buyurtmani bekor qilish</AlertDialogTitle>
                      <AlertDialogDescription>
                        Buyurtma #{order.id} bekor qilinadi va mahsulotlar omborga qaytariladi.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Qaytish</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleCancel(order.id)} className="bg-rose-600 hover:bg-rose-700 text-white">
                        Bekor qilish
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EmptyState = ({ type }: { type: "pending" | "completed" }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
      <div className="h-20 w-20 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
        {type === "pending" ? (
          <Clock className="w-10 h-10 text-muted-foreground/50" />
        ) : (
          <CheckCircle2 className="w-10 h-10 text-muted-foreground/50" />
        )}
      </div>
      <h3 className="text-lg font-bold text-[#212B36] dark:text-white mb-2">
        {type === "pending" ? "Kutilayotgan buyurtmalar yo'q" : "Yakunlangan buyurtmalar yo'q"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">
        {type === "pending" 
          ? "Yangi buyurtmalar kelib tushganda shu yerda ko'rinadi"
          : "Tasdiqlangan yoki bekor qilingan buyurtmalar tarixi shu yerda saqlanadi"}
      </p>
    </div>
  );

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Buyurtmalar"
        description="Barcha buyurtmalarni nazorat qilish"
      />

      <div className="flex flex-col space-y-6">
        {/* Custom Tabs */}
        <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("pending")}
            className={cn(
              "relative px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200",
              activeTab === "pending"
                ? "bg-white dark:bg-[#132326] text-[#212B36] dark:text-white shadow-sm"
                : "text-muted-foreground hover:text-[#212B36] dark:hover:text-white"
            )}
          >
            <div className="flex items-center gap-2">
              Kutilayotgan
              {pendingOrders.length > 0 && (
                <Badge className="bg-amber-500 hover:bg-amber-600 border-0 px-1.5 h-5 min-w-[20px] flex items-center justify-center">
                  {pendingOrders.length}
                </Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={cn(
              "relative px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200",
              activeTab === "completed"
                ? "bg-white dark:bg-[#132326] text-[#212B36] dark:text-white shadow-sm"
                : "text-muted-foreground hover:text-[#212B36] dark:hover:text-white"
            )}
          >
            <div className="flex items-center gap-2">
              Yakunlangan
              <span className="text-xs font-medium opacity-60 bg-gray-200 dark:bg-white/10 px-1.5 h-5 rounded-full flex items-center">
                {processedOrders.length}
              </span>
            </div>
          </button>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "pending" ? (
              pendingOrders.length === 0 ? (
                <EmptyState type="pending" />
              ) : (
                pendingOrders.map((order: Order) => <OrderCard key={order.id} order={order} />)
              )
            ) : (
              processedOrders.length === 0 ? (
                <EmptyState type="completed" />
              ) : (
                processedOrders.map((order: Order) => <OrderCard key={order.id} order={order} />)
              )
            )}
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <OrderDetailsDialog 
        order={selectedOrder} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
      />
    </div>
  );
}
