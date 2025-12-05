"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, RefreshCw } from "lucide-react";

// Services & Hooks
import { orderService } from "@/lib/services/order.service";
import { useSocket } from "@/hooks/use-socket";
import type { Order } from "@/types/api";

// Components
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { getColumns } from "../orders/columns";

// 🔥 OrderCard Import (Yo'lini o'zingizga moslang)
import { OrderCard } from "@/components/seller/orders/order-card";

type TabType = "pending" | "completed";

export default function SellerOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const socket = useSocket();
  const [activeTab, setActiveTab] = useState<TabType>("pending");

  // 1. DATA FETCHING
  const { data: orders = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["orders"], 
    queryFn: () => orderService.getAll(),
  });

  // 2. REAL-TIME UPDATES
  useEffect(() => {
    if (!socket) return;

    const handleRefetch = (data: any) => {
      console.log("🔄 Socket update received:", data); 
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    };

    socket.on("new_order", handleRefetch);
    socket.on("order_updated", handleRefetch);
    socket.on("order_status_change", handleRefetch);
    socket.on("stock_update", handleRefetch);

    return () => {
      socket.off("new_order");
      socket.off("order_updated");
      socket.off("order_status_change");
      socket.off("stock_update");
    };
  }, [socket, queryClient]);

  // 3. FILTERING
  const pendingOrders = useMemo(() => 
    orders.filter((order) => order.status === "draft"), 
  [orders]);
  
  const completedOrders = useMemo(() => 
    orders.filter((order) => order.status !== "draft"), 
  [orders]);

  const currentOrders = activeTab === "pending" ? pendingOrders : completedOrders;

  // 4. HANDLERS
  const handleEdit = (order: Order) => {
    if (order.status === 'draft') {
      router.push(`/seller/orders/edit/${order.id}`);
    } else {
      toast.error("Faqat kutilayotgan buyurtmalarni tahrirlash mumkin");
    }
  };

  const handleManualRefresh = async () => {
    await refetch();
    toast.success("Ma'lumotlar yangilandi");
  };
  
  // O'chirish logikasi (Hozircha shunchaki toast, keyin API ulaysiz)
  const handleDelete = (order: Order) => {
    if(confirm("Buyurtmani bekor qilmoqchimisiz?")) {
        // API call here...
        toast.info("Buyurtma bekor qilishga yuborildi");
    }
  }

  const columns = useMemo(() => getColumns({
    onEdit: handleEdit,
  }), []);

  return (
    // 🔥 ASOSIY WRAPPER: Ekran bo'yi cho'ziladi
    // Header (masalan 80px) + Paddinglar hisobiga 140px ayiramiz
    <div className="flex flex-col h-[calc(100vh-140px)] w-full gap-6">
      
      {/* 1. FIXED HEADER */}
      <div className="shrink-0">
        <PageHeader
          title="Buyurtmalar Tarixi"
          description="Siz yaratgan barcha buyurtmalar ro'yxati va holati"
        >
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualRefresh}
            disabled={isLoading || isRefetching}
            className="transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefetching && "animate-spin")} />
            {isRefetching ? "Yangilanmoqda..." : "Yangilash"}
          </Button>
        </PageHeader>
      </div>

      {/* 2. FIXED TABS */}
      <div className="shrink-0 w-full overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl min-w-max md:min-w-0 md:w-fit">
          <TabButton 
            active={activeTab === "pending"} 
            onClick={() => setActiveTab("pending")}
            label="Kutilayotgan"
            count={pendingOrders.length}
            badgeColor="bg-amber-500 hover:bg-amber-600 text-white"
          />
          <TabButton 
            active={activeTab === "completed"} 
            onClick={() => setActiveTab("completed")}
            label="Yakunlangan"
            count={completedOrders.length}
            badgeColor="bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300"
          />
        </div>
      </div>

      {/* 3. SCROLLABLE CONTENT */}
      {/* flex-1: Qolgan joyni egallaydi
          overflow-y-auto: Scroll bo'ladi
          scrollbarni yashirish klasslari
      */}
      <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] pb-20 pr-1">
        
        {isLoading ? (
          // Loading Skeletons
          <div className="space-y-3">
             {[1,2,3,4,5].map(i => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse w-full" />
             ))}
          </div>
        ) : currentOrders.length === 0 ? (
          <div className="h-full flex flex-col justify-center pb-20">
             <EmptyState type={activeTab} />
          </div>
        ) : (
          <>
            {/* DESKTOP: Table */}
            <div className="hidden xl:block rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] overflow-hidden shadow-sm">
              <DataTable columns={columns} data={currentOrders} />
            </div>

            {/* TABLET & MOBILE: Card List */}
            <div className="xl:hidden flex flex-col space-y-3">
              {currentOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function TabButton({ 
  active, 
  onClick, 
  label, 
  count, 
  badgeColor 
}: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  count: number; 
  badgeColor: string; 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-4 md:px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2",
        active
          ? "bg-white dark:bg-[#132326] text-[#212B36] dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          : "text-muted-foreground hover:text-[#212B36] dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/5"
      )}
    >
      {label}
      {count > 0 && (
        <Badge className={cn("border-0 px-2 h-5 min-w-[20px] flex items-center justify-center transition-colors font-bold", badgeColor)}>
          {count}
        </Badge>
      )}
    </button>
  );
}

function EmptyState({ type }: { type: TabType }) {
  const isPending = type === "pending";
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl bg-gray-50/50 dark:bg-white/[0.02] m-1">
      <div className="h-24 w-24 rounded-3xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center mb-6">
        {isPending ? (
          <Clock className="w-12 h-12 text-amber-500/80" />
        ) : (
          <CheckCircle2 className="w-12 h-12 text-emerald-500/80" />
        )}
      </div>
      <h3 className="text-xl font-bold text-[#212B36] dark:text-white mb-2">
        {isPending ? "Kutilayotgan buyurtmalar yo'q" : "Yakunlangan buyurtmalar yo'q"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[300px] mx-auto leading-relaxed">
        {isPending
          ? "Yangi buyurtma yaratganingizda, ular tasdiqlanishini kutish jarayonida shu yerda paydo bo'ladi."
          : "Tarixda yopilgan, tasdiqlangan yoki bekor qilingan buyurtmalar topilmadi."}
      </p>
    </div>
  );
}