"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Loader2, AlertCircle, RotateCcw, Scissors, Eye, MoreHorizontal, Wallet } from "lucide-react";

import { orderService } from "@/lib/services/order.service";
import { Order } from "@/types/api";
import { formatCurrency, cn } from "@/lib/utils";
import { format } from "date-fns";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle, // 🔥 XATONI YO'QOTISH UCHUN BU KERAK
} from "@/components/ui/dialog"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { OrderDetailsDialog } from "@/components/orders/order-details-dialog";
import { getColumns } from "./columns";

// ----------------------------------------------------------------------
// 1. ADMIN ORDER CARD (MOBIL UCHUN)
// ----------------------------------------------------------------------
function AdminOrderCard({ order, onView, onFullRefund, onPartialRefund }: any) {
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
                  <DropdownMenuItem onClick={() => onFullRefund(order)} className="cursor-pointer text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20 py-2.5">
                    <RotateCcw className="w-4 h-4 mr-2" /> To'liq qaytarish
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPartialRefund(order)} className="cursor-pointer text-orange-600 focus:text-orange-700 focus:bg-orange-50 dark:focus:bg-orange-900/20 py-2.5">
                    <Scissors className="w-4 h-4 mr-2" /> Qisman qaytarish
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
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const [searchId, setSearchId] = useState("");
  const [orderIdToFetch, setOrderIdToFetch] = useState<number | null>(null);
  
  // Dialog States
  const [fullRefundOrder, setFullRefundOrder] = useState<Order | null>(null);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // 1. QUERY
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ["admin-order", orderIdToFetch],
    queryFn: () => orderService.getById(orderIdToFetch!),
    enabled: !!orderIdToFetch && orderIdToFetch > 0,
    retry: false,
  });

  // 2. MUTATION
  const fullRefundMutation = useMutation({
    mutationFn: (orderId: number) => orderService.refund(orderId, {
       items: fullRefundOrder?.items?.map((i: any) => ({
          productId: i.productId,
          quantity: Number(i.quantity)
       })) || [],
       reason: "Admin tomonidan to'liq qaytarildi"
    }),
    onSuccess: () => {
      toast.success("Buyurtma to'liq qaytarildi");
      setFullRefundOrder(null);
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderIdToFetch] });
    },
    onError: (err: any) => toast.error(err.message || "Xatolik yuz berdi"),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    setOrderIdToFetch(Number(searchId));
  };

  const handleFullRefund = (order: Order) => setFullRefundOrder(order);
  const handlePartialRefund = (order: Order) => router.push(`/admin/orders/${order.id}/refund`);
  
  const handleView = (order: Order) => {
    setViewOrder(order);
    setIsDetailsOpen(true);
  };

  const columns = getColumns({
    onView: handleView,
    onFullRefund: handleFullRefund,
    onPartialRefund: handlePartialRefund,
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
                    onFullRefund={handleFullRefund} 
                    onPartialRefund={handlePartialRefund} 
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

      {/* 🔥 MUKAMMAL FULL REFUND DIALOG (FIXED) */}
      <Dialog open={!!fullRefundOrder} onOpenChange={(open) => !open && setFullRefundOrder(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#1C2C30] border-none shadow-2xl rounded-3xl">
          
          <div className="p-6 flex flex-col items-center text-center">
            {/* ICON */}
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-5 ring-4 ring-rose-50/50 dark:ring-rose-900/10">
               <RotateCcw className="w-8 h-8 text-rose-600 dark:text-rose-500" />
            </div>
            
            {/* 🔥 TITLE FIX: h2 emas, DialogTitle */}
            <DialogTitle className="text-xl font-bold text-[#212B36] dark:text-white">
                To'liq qaytarish
            </DialogTitle>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-[280px] leading-relaxed">
              Buyurtma <span className="font-bold text-[#212B36] dark:text-white">#{fullRefundOrder?.id}</span> dagi barcha mahsulotlar omborga qaytariladi.
            </p>

            {/* MONEY BOX */}
            <div className="w-full mt-6 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
               <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Wallet className="w-3 h-3" />
                    Mijozga qaytariladigan summa
                  </span>
               </div>
               <div className="flex items-center justify-center pt-1">
                  <span className="text-2xl font-extrabold text-[#00B8D9] tracking-tight">
                    {fullRefundOrder && formatCurrency(Number(fullRefundOrder.finalAmount), "UZS")}
                  </span>
               </div>
            </div>
          </div>
          
          {/* FOOTER (GRID) */}
          <div className="p-6 pt-0 grid grid-cols-2 gap-3 w-full">
            <DialogClose asChild>
                <Button variant="outline" className="h-12 rounded-xl border-gray-200 dark:border-white/10 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    Bekor qilish
                </Button>
            </DialogClose>
            
            <Button 
              onClick={() => fullRefundOrder && fullRefundMutation.mutate(fullRefundOrder.id)}
              className="h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95"
              disabled={fullRefundMutation.isPending}
            >
              {fullRefundMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tasdiqlash"}
            </Button>
          </div>

        </DialogContent>
      </Dialog>

    </div>
  );
}