"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/lib/services/order.service";
import type { Order } from "@/types/api"; 
import { useSocket } from "@/hooks/use-socket";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  Clock,
  CheckCircle2,
  XCircle, // 🔥 IMPORT QO'SHILDI
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);

  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [cancelOrder, setCancelOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getAll(),
  });

  useEffect(() => {
    if (!socket) return;
    socket.emit("join_admin");

    const handleRefetch = () => queryClient.invalidateQueries({ queryKey: ["orders"] });

    socket.on("new_order", (data) => {
      toast.success(`Yangi buyurtma #${data.id} qabul qilindi!`);
      handleRefetch();
    });

    socket.on("order_updated", (data) => {
      toast.info(`Buyurtma #${data.id} tahrir qilindi`);
      handleRefetch();
    });

    socket.on("order_status_change", handleRefetch);

    socket.on("order_printed", (data) => {
      toast.success(`Buyurtma #${data.id} chop etildi`);
      handleRefetch();
    });
    

    return () => {
      socket.off("new_order");
      socket.off("order_updated");
      socket.off("order_status_change");
      socket.off("order_printed");
    };
  }, [socket, queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: "completed" | "cancelled" }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: (updatedOrder, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      if (variables.status === "completed") {
        toast.success("Buyurtma tasdiqlandi");
        const orderToShow = confirmOrder; 
        if (orderToShow) {
          setConfirmOrder(null);
          const freshOrder = { ...orderToShow, status: "completed" as const };
          setTimeout(() => {
            setReceiptOrder(freshOrder);
          }, 300);
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

  const pendingOrders = useMemo(() => orders.filter((order: Order) => order.status === "draft"), [orders]);
  const historyOrders = useMemo(() => orders.filter((order: Order) => order.status !== "draft" && order.status !== "cancelled"), [orders]);
  const unprintedOrders = useMemo(() => historyOrders.filter((order: Order) => !order.isPrinted), [historyOrders]);
  const printedOrders = useMemo(() => historyOrders.filter((order: Order) => order.isPrinted), [historyOrders]);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handlePrint = (order: Order) => {
    setReceiptOrder(order);
  };

  const handleEdit = (order: Order) => {
    router.push(`/cashier/orders/edit/${order.id}`);
  };

  const handleConfirm = (order: Order) => {
    setConfirmOrder(order);
  };

  const handleCancel = (order: Order) => {
    setCancelOrder(order);
  };

  const columns = useMemo(() => getColumns({
    onView: handleViewDetails,
    onPrint: handlePrint,
    onEdit: handleEdit,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  }), []);

  const currentOrders = activeTab === "pending"
    ? pendingOrders
    : activeTab === "unprinted"
      ? unprintedOrders
      : printedOrders;

  const EmptyState = ({ type }: { type: TabType }) => (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-3xl bg-gray-50/50 dark:bg-white/[0.02]">
      <div className="h-24 w-24 rounded-full bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center mb-6">
        {type === "pending" ? (
          <Clock className="w-10 h-10 text-amber-500/80" />
        ) : (
          <CheckCircle2 className="w-10 h-10 text-emerald-500/80" />
        )}
      </div>
      <h3 className="text-xl font-bold text-[#212B36] dark:text-white mb-2">
        {type === "pending"
          ? "Kutilayotgan buyurtmalar yo'q"
          : type === "unprinted"
            ? "Barcha cheklar chiqarilgan"
            : "Arxiv bo'sh"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
        {type === "pending"
          ? "Yangi buyurtmalar kelib tushganda shu yerda ko'rinadi"
          : "Hozircha hech qanday ma'lumot mavjud emas"}
      </p>
    </div>
  );
  const { data: session } = useSession();

  console.log(session);

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Buyurtmalar"
        description="Barcha buyurtmalarni nazorat qilish"
      />

      <div className="flex flex-col space-y-6">
        <div className="w-full overflow-x-auto pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl min-w-max md:min-w-0 md:w-fit">
            <TabButton 
              active={activeTab === "pending"} 
              onClick={() => setActiveTab("pending")} 
              label="Kutilayotgan" 
              count={pendingOrders.length} 
              color="bg-amber-500" 
            />
            <TabButton 
              active={activeTab === "unprinted"} 
              onClick={() => setActiveTab("unprinted")} 
              label="Chop etilmagan" 
              count={unprintedOrders.length} 
              // 🔥 O'ZGARTIRILDI: bg-blue-500 -> bg-[#00B8D9]
              color="bg-emerald-600" 
            />
            <TabButton 
              active={activeTab === "printed"} 
              onClick={() => setActiveTab("printed")} 
              label="Arxiv" 
              count={printedOrders.length} 
              color="bg-gray-500" 
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton columnCount={7} rowCount={8} />
        ) : currentOrders.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] overflow-hidden shadow-sm">
            <DataTable columns={columns} data={currentOrders} />
          </div>
        )}
      </div>

      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <ReceiptPreview
        order={receiptOrder}
        open={!!receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />

      <AlertDialog open={!!confirmOrder} onOpenChange={(open) => !open && setConfirmOrder(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl max-w-md rounded-2xl">
          <AlertDialogHeader className="space-y-4 items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">Buyurtmani tasdiqlash</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                Buyurtma <span className="font-bold text-[#00B8D9]">#{confirmOrder?.id}</span> tasdiqlangandan keyin chek chiqarish oynasi ochiladi.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full sm:justify-center gap-3">
            <AlertDialogCancel className="w-full sm:w-auto h-11 rounded-xl">Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmOrder && updateStatusMutation.mutate({
                orderId: confirmOrder.id,
                status: "completed"
              })}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 h-11 rounded-xl px-8"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancelOrder} onOpenChange={(open) => !open && setCancelOrder(null)}>
        <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl max-w-md rounded-2xl">
          <AlertDialogHeader className="space-y-4 items-center text-center">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <AlertDialogTitle className="text-xl">Buyurtmani bekor qilish</AlertDialogTitle>
              <AlertDialogDescription className="mt-2">
                Buyurtma <span className="font-bold text-rose-600">#{cancelOrder?.id}</span> bekor qilinadi va mahsulotlar omborga qaytariladi.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full sm:justify-center gap-3">
            <AlertDialogCancel className="w-full sm:w-auto h-11 rounded-xl">Qaytish</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelOrder && updateStatusMutation.mutate({
                orderId: cancelOrder.id,
                status: "cancelled"
              })}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 h-11 rounded-xl px-8"
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

function TabButton({ active, onClick, label, count, color }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2.5",
        active
          ? "bg-white dark:bg-[#132326] text-[#212B36] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          : "text-muted-foreground hover:text-[#212B36] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
      )}
    >
      {label}
      {count > 0 && (
        <Badge className={cn("border-0 px-2 h-5 min-w-[20px] flex items-center justify-center", color, "text-white")}>
          {count}
        </Badge>
      )}
    </button>
  );
}