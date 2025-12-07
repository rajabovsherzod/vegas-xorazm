"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Loader2, AlertCircle, MoreHorizontal, Eye, RotateCcw, Scissors } from "lucide-react";
import { format } from "date-fns";

import { orderService } from "@/lib/services/order.service";
import { Order } from "@/types/api";
import { formatCurrency } from "@/lib/utils";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dialoglar
import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";
import { RefundDialog } from "@/components/orders/refund-dialog"; // 🔥 O'ZIMIZ YASAGAN YANGI DIALOG
import { getColumns } from "./columns";

// ----------------------------------------------------------------------
// 1. ADMIN ORDER CARD (MOBIL UCHUN)
// ----------------------------------------------------------------------
function AdminOrderCard({ order, onView, onRefund }: any) {
  const canRefund = order.status === 'completed' || order.status === 'partially_refunded';

  return (
    <div className="bg-white dark:bg-[#132326] rounded-2xl border border-gray-200 dark:border-white/10 p-4 shadow-sm relative">
      <div className="flex justify-between items-start gap-3">
        {/* INFO */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-[#212B36] dark:text-white">#{order.id}</h3>
            <Badge variant="outline" className="text-[10px] uppercase">{order.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
             <span className="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-[10px]">
                {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")}
             </span>
             <span>•</span>
             <span>{order.customerName || "Mijoz yo'q"}</span>
          </p>
        </div>

        {/* PRICE & ACTIONS */}
        <div className="flex flex-col items-end gap-2">
          <div className="text-lg font-extrabold text-[#00B8D9]">
            {formatCurrency(Number(order.finalAmount), "UZS")}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#1C2C30] border-gray-200 dark:border-white/10 shadow-xl z-[50]">
              <DropdownMenuLabel>Amallar</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => onView(order)} className="cursor-pointer py-2.5">
                <Eye className="w-4 h-4 mr-2 opacity-70" /> Ko'rish
              </DropdownMenuItem>

              {canRefund && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onRefund(order)} className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 py-2.5">
                    <RotateCcw className="w-4 h-4 mr-2" /> Qaytarish (Refund)
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. MAIN PAGE
// ----------------------------------------------------------------------
export default function AdminOrdersPage() {
  const [searchId, setSearchId] = useState("");
  const [orderIdToFetch, setOrderIdToFetch] = useState<number | null>(null);
  
  // Dialog States
  const [refundOrder, setRefundOrder] = useState<Order | null>(null); // 🔥 BITTA STATE YETARLI
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  // 1. QUERY
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", orderIdToFetch],
    queryFn: () => orderService.getById(orderIdToFetch!),
    enabled: !!orderIdToFetch && orderIdToFetch > 0,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    setOrderIdToFetch(Number(searchId));
  };

  // 🔥 YAGONA REFUND HANDLER
  const handleRefund = (order: Order) => {
    setRefundOrder(order);
    setIsRefundOpen(true);
  };
  
  const handleView = (order: Order) => {
    setViewOrder(order);
    setIsDetailsOpen(true);
  };

  // Columns ga endi bitta onRefund funksiyasini beramiz
  const columns = getColumns({
    onView: handleView,
    onRefund: handleRefund, 
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buyurtma Qidirish"
        description="ID orqali topish va qaytarish"
      >
        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="ID (masalan: 41)" 
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-9 w-[200px] bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 font-bold"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={isLoading} className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white font-bold px-6">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Qidirish"}
          </Button>
        </form>
      </PageHeader>

      {/* RESULT AREA */}
      <div>
        {isLoading ? (
           <div className="py-20 text-center text-muted-foreground animate-pulse">Qidirilmoqda...</div>
        ) : isError ? (
           <div className="flex flex-col items-center justify-center py-10 text-rose-500 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="font-bold">Buyurtma topilmadi</p>
              <p className="text-sm opacity-80">ID raqamini tekshiring</p>
           </div>
        ) : order ? (
           <>
              <div className="hidden md:block rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] overflow-hidden shadow-sm">
                 <DataTable columns={columns} data={[order]} />
              </div>
              <div className="md:hidden">
                 <AdminOrderCard 
                    order={order} 
                    onView={handleView}
                    onRefund={handleRefund} 
                 />
              </div>
           </>
        ) : (
           <div className="py-20 flex flex-col items-center justify-center text-muted-foreground/40 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
              <Search className="w-12 h-12 mb-3 opacity-50" />
              <p>Natija shu yerda ko'rinadi</p>
           </div>
        )}
      </div>

      {/* ORDER DETAILS DIALOG */}
      <OrderDetailsDialog 
        order={viewOrder} 
        open={isDetailsOpen} 
        onOpenChange={setIsDetailsOpen} 
      />

      {/* 🔥 UNIVERSAL REFUND DIALOG */}
      <RefundDialog 
        order={refundOrder}
        open={isRefundOpen}
        onOpenChange={setIsRefundOpen}
      />

    </div>
  );
}