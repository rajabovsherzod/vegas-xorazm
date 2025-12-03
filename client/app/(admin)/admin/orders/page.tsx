"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, Order } from "@/lib/services/order.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
} from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";
import { ReceiptPreview } from "@/components/orders/receipt-preview";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { TableSkeleton } from "@/components/ui/table-skeleton";

type TabType = "pending" | "unprinted" | "printed";

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  // For confirmation dialogs
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getAll(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, orderData }: { orderId: number; status: "completed" | "cancelled"; orderData?: Order }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: (updatedOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      if (variables.status === "completed") {
        toast.success("Buyurtma tasdiqlandi");
        console.log("✅ Order confirmed:", updatedOrder);
        console.log("📄 Order data from variables:", variables.orderData);

        // Tasdiqlangandan keyin chek preview ochish
        const orderToShow = variables.orderData;

        if (orderToShow) {
          // Dialog ni yopish
          setConfirmOrder(null);

          // Updated order ni yaratish
          const freshOrder = { ...orderToShow, status: "completed" as const };
          console.log("🎫 Setting receipt order:", freshOrder);

          // Kichik kechikish bilan ochish
          setTimeout(() => {
            setReceiptOrder(freshOrder);
          }, 300);
        } else {
          console.error("❌ No order data!");
          setConfirmOrder(null);
        }
      } else {
        toast.success("Buyurtma bekor qilindi");
        setCancelOrder(null);
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  const pendingOrders = orders.filter((order: Order) => order.status === "draft");
  const completedOrders = orders.filter((order: Order) => order.status !== "draft");
  const unprintedOrders = completedOrders.filter((order: Order) => !order.isPrinted);
  const printedOrders = completedOrders.filter((order: Order) => order.isPrinted);

  // Callbacks for columns
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handlePrint = (order: Order) => {
    setReceiptOrder(order);
  };

  const handleConfirm = (order: Order) => {
    setConfirmOrder(order);
  };

  const handleCancel = (order: Order) => {
    setCancelOrder(order);
  };

  // Define columns
  const columns = useMemo(() => getColumns({
    onView: handleViewDetails,
    onPrint: handlePrint,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }), []);

  const currentOrders = activeTab === "pending"
    ? pendingOrders
    : activeTab === "unprinted"
      ? unprintedOrders
      : printedOrders;

  const EmptyState = ({ type }: { type: TabType }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl">
      <div className="h-20 w-20 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-4">
        {type === "pending" ? (
          <Clock className="w-10 h-10 text-muted-foreground/50" />
        ) : (
          <CheckCircle2 className="w-10 h-10 text-muted-foreground/50" />
        )}
      </div>
      <h3 className="text-lg font-bold text-[#212B36] dark:text-white mb-2">
        {type === "pending"
          ? "Kutilayotgan buyurtmalar yo'q"
          : type === "unprinted"
            ? "Chop etilmagan buyurtmalar yo'q"
            : "Arxiv bo'sh"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">
        {type === "pending"
          ? "Yangi buyurtmalar kelib tushganda shu yerda ko'rinadi"
          : type === "unprinted"
            ? "Barcha tasdiqlangan buyurtmalar chop etilgan"
            : "Chop etilgan buyurtmalar shu yerda saqlanadi"}
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
        <div className="w-full overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl min-w-max md:min-w-0 md:w-fit">
            <button
              onClick={() => setActiveTab("pending")}
              className={cn(
                "relative px-4 md:px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                activeTab === "pending"
                  ? "bg-white dark:bg-[#132326] text-[#212B36] dark:text-white shadow-sm"
                  : "text-muted-foreground hover:text-[#212B36] dark:hover:text-white"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                Kutilayotgan
                {pendingOrders.length > 0 && (
                  <Badge className="bg-amber-500 hover:bg-amber-600 border-0 px-1.5 h-5 min-w-[20px] flex items-center justify-center">
                    {pendingOrders.length}
                  </Badge>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("unprinted")}
              className={cn(
                "relative px-4 md:px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                activeTab === "unprinted"
                  ? "bg-white dark:bg-[#132326] text-[#212B36] dark:text-white shadow-sm"
                  : "text-muted-foreground hover:text-[#212B36] dark:hover:text-white"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                Chop etilmagan
                <span className="text-xs font-medium opacity-60 bg-gray-200 dark:bg-white/10 px-1.5 h-5 rounded-full flex items-center">
                  {unprintedOrders.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("printed")}
              className={cn(
                "relative px-4 md:px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap",
                activeTab === "printed"
                  ? "bg-white dark:bg-[#132326] text-[#212B36] dark:text-white shadow-sm"
                  : "text-muted-foreground hover:text-[#212B36] dark:hover:text-white"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                Arxiv
                <span className="text-xs font-medium opacity-60 bg-gray-200 dark:bg-white/10 px-1.5 h-5 rounded-full flex items-center">
                  {printedOrders.length}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Table */}
        {isLoading ? (
          <TableSkeleton columnCount={7} rowCount={8} />
        ) : currentOrders.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <DataTable columns={columns} data={currentOrders} />
        )}
      </div>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      {/* Receipt Preview Dialog */}
      <ReceiptPreview
        order={receiptOrder}
        open={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />

      {/* Confirm Dialog */}
      <AlertDialog open={!!confirmOrder} onOpenChange={(open) => !open && setConfirmOrder(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 shadow-2xl max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Buyurtmani tasdiqlash
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Buyurtma <span className="font-bold text-[#00B8D9]">#{confirmOrder?.id}</span> tasdiqlangandan keyin chek chiqarish oynasi ochiladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmOrder && updateStatusMutation.mutate({
                orderId: confirmOrder.id,
                status: "completed",
                orderData: confirmOrder
              })}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Dialog */}
      <AlertDialog open={!!cancelOrder} onOpenChange={(open) => !open && setCancelOrder(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 shadow-2xl max-w-md">
          <AlertDialogHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <Clock className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-xl">
              Buyurtmani bekor qilish
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Buyurtma <span className="font-bold text-rose-600">#{cancelOrder?.id}</span> bekor qilinadi va mahsulotlar omborga qaytariladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Qaytish
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelOrder && updateStatusMutation.mutate({
                orderId: cancelOrder.id,
                status: "cancelled",
                orderData: cancelOrder
              })}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Bekor qilinmoqda..." : "Bekor qilish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}