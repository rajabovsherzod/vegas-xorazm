"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/api"; 
import { format } from "date-fns";
import {
  Package,
  User,
  Calendar,
  CreditCard,
  Printer,
  Banknote,
  Building2,
  Receipt,
  Loader2,
  Eye,
  Tag,
  ArrowDownCircle
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { printService } from "@/lib/services/print.service";
import { loadQZTray } from "@/lib/utils/qz-tray-loader";
import { toast } from "sonner";
import { ReceiptPreview } from "./receipt-preview";

const paymentMethodMap: Record<string, { label: string; icon: any }> = {
  cash: { label: "Naqd", icon: Banknote },
  card: { label: "Karta", icon: CreditCard },
  transfer: { label: "O'tkazma", icon: Building2 },
  debt: { label: "Nasiya", icon: Receipt },
};

interface OrderDetailsDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [qzTrayLoaded, setQzTrayLoaded] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);

  useEffect(() => {
    if (!open) {
      setShowReceiptPreview(false);
      setIsPrinting(false);
    }
  }, [open]);

  useEffect(() => {
    setShowReceiptPreview(false);
  }, [order?.id]);

  useEffect(() => {
    if (open && !qzTrayLoaded) {
      loadQZTray()
        .then(() => setQzTrayLoaded(true))
        .catch((error) => console.warn('QZ Tray yuklanmadi:', error));
    }
  }, [open, qzTrayLoaded]);

  // 🔥 1. MATEMATIKA (CHEK BILAN BIR XIL LOGIKA)
  const { realOriginalTotal, finalPayable, totalSaved } = useMemo(() => {
    if (!order) return { realOriginalTotal: 0, finalPayable: 0, totalSaved: 0 };

    // 1. To'lanadigan yakuniy summa (Baza aniq beradi)
    const finalAmount = Number(order.finalAmount);

    // 2. Real Original Summa (Tovarlarning ASL narxlari yig'indisi)
    const originalTotal = order.items?.reduce((acc, item) => {
      // Agar originalPrice 0 yoki null bo'lsa, demak chegirma yo'q, oddiy price olinadi
      const originalPrice = Number(item.originalPrice) > 0 ? Number(item.originalPrice) : Number(item.price);
      return acc + (Number(item.quantity) * originalPrice);
    }, 0);

    // 3. Jami tejalgan summa (Chekdagidek: Asl narx - To'langan narx)
    // Bu yerda promo-aksiya, kassa chegirmasi va manual chegirma hammasi ichida ketadi.
    const saved = (originalTotal || 0) - finalAmount;

    return {
      realOriginalTotal: originalTotal || 0,
      finalPayable: finalAmount,
      totalSaved: saved
    };
  }, [order]);

  if (!order) return null;

  const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap.cash;
  const PaymentIcon = payment.icon;

  const handlePrint = async () => {
    if (!printService.isAvailable()) {
      toast.error('QZ Tray o\'rnatilmagan.');
      return;
    }
    setIsPrinting(true);
    try {
      await printService.printReceipt(order);
      toast.success('Chek muvaffaqiyatli chiqarildi!');
    } catch (error: any) {
      toast.error(`Chek chiqarishda xatolik: ${error.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <DialogHeader className="border-b border-gray-100 dark:border-white/10 pb-4">
          <DialogTitle className="flex items-center justify-between text-xl font-bold text-[#212B36] dark:text-white">
            <span className="flex items-center gap-2">
              Buyurtma #{order.id}
              <Badge variant="outline" className={cn(
                "ml-2 border",
                order.status === 'completed' ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30" :
                order.status === 'draft' ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30" :
                "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30"
              )}>
                {order.status === 'completed' ? "Yakunlangan" : order.status === 'draft' ? "Kutilmoqda" : "Bekor qilingan"}
              </Badge>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          
          {/* INFO COLUMN */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mijoz</p>
                <p className="font-bold text-[#212B36] dark:text-white">{order.customerName || "Noma'lum"}</p>
                {order.partner && <p className="text-xs text-muted-foreground">{order.partner.phone}</p>}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sotuvchi</p>
                <p className="font-bold text-[#212B36] dark:text-white">{order.seller?.fullName || "Kassir"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sana</p>
                <p className="font-bold text-[#212B36] dark:text-white">
                  {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 dark:bg-white/5 rounded-lg">
                <PaymentIcon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">To'lov turi</p>
                <p className="font-bold text-[#212B36] dark:text-white capitalize">{payment.label}</p>
              </div>
            </div>
          </div>

          {/* ITEMS COLUMN */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 h-full border border-gray-100 dark:border-white/5 flex flex-col">
            <h4 className="font-bold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Mahsulotlar ({order.items?.length || 0})
            </h4>
            
            <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-2 flex-1 custom-scrollbar">
              {order.items?.map((item: any, index: number) => {
                const isUSD = item.product?.currency === 'USD';
                const rate = Number(order.exchangeRate) || 1;
                const quantity = Number(item.quantity);
                const itemTotalUZS = Number(item.totalPrice);

                // Asl narxlar (UZS)
                const soldPriceUZS = Number(item.price);
                const originalPriceUZS = Number(item.originalPrice) > 0 ? Number(item.originalPrice) : soldPriceUZS;

                // Chegirma bormi? (Sotilgan narx < Asl narx)
                const hasItemDiscount = soldPriceUZS < originalPriceUZS;

                // Ko'rsatish uchun narxlar
                const displaySoldPrice = isUSD ? soldPriceUZS / rate : soldPriceUZS;
                const displayOriginalPrice = isUSD ? originalPriceUZS / rate : originalPriceUZS;

                return (
                  <div key={index} className="flex justify-between items-start gap-3 border-b border-gray-200 dark:border-white/10 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#212B36] dark:text-white mb-1 line-clamp-1">
                        {item.product?.name || "Mahsulot"}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                         <span>{quantity} x</span>
                         
                         {hasItemDiscount ? (
                            <>
                               <span className="line-through decoration-rose-500/50 decoration-1 text-gray-400">
                                   {isUSD ? `$${displayOriginalPrice.toFixed(2)}` : formatCurrency(displayOriginalPrice, "UZS")}
                               </span>
                               <span className="font-bold text-[#00B8D9]">
                                   {isUSD ? `$${displaySoldPrice.toFixed(2)}` : formatCurrency(displaySoldPrice, "UZS")}
                               </span>
                               
                               {/* Manual Discount Badge */}
                               {item.manualDiscountValue && Number(item.manualDiscountValue) > 0 && (
                                   <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1 py-0.5 rounded text-[9px] font-bold">
                                       -{item.manualDiscountValue}{item.manualDiscountType === 'percent' ? '%' : ''}
                                   </span>
                               )}
                            </>
                         ) : (
                            <span className="font-medium">
                                {isUSD ? `$${displaySoldPrice.toFixed(2)}` : formatCurrency(displaySoldPrice, "UZS")}
                            </span>
                         )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[#212B36] dark:text-white whitespace-nowrap">
                        {formatCurrency(itemTotalUZS, "UZS")}
                      </p>
                      {isUSD && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              ${(itemTotalUZS / rate).toFixed(2)}
                          </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* 🔥 FOOTER: ANIQ MATEMATIKA */}
            <div className="mt-4 pt-3 border-t border-dashed border-gray-300 dark:border-white/20 space-y-2">
                
                {/* 1. ASL NARXLAR YIG'INDISI (Agar chegirma bo'lsa line-through bo'ladi) */}
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Jami qiymat (Asl narxlar):</span>
                    <span className={cn(totalSaved > 0 && "line-through decoration-rose-500/50 decoration-1")}>
                      {formatCurrency(realOriginalTotal, "UZS")}
                    </span>
                </div>
                
                {/* 2. JAMI TEJALGAN SUMMA */}
                {totalSaved > 0 && (
                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <ArrowDownCircle className="w-3.5 h-3.5" /> 
                            Tejaldi:
                        </span>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                          -{formatCurrency(totalSaved, "UZS")}
                        </span>
                    </div>
                )}

                {/* 3. TO'LANADIGAN SUMMA */}
                <div className="flex justify-between items-end pt-2 border-t border-gray-100 dark:border-white/10">
                    <span className="font-bold text-sm text-[#212B36] dark:text-white">To'lanadigan summa:</span>
                    <span className="text-xl font-extrabold text-[#00B8D9]">
                        {formatCurrency(finalPayable, "UZS")}
                    </span>
                </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto rounded-xl">
            Yopish
          </Button>
          {order.status === "completed" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="flex-1 sm:flex-none rounded-xl"
                onClick={() => setShowReceiptPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Chekni ko'rish
              </Button>
              <Button
                className="flex-1 sm:flex-none bg-[#212B36] dark:bg-white dark:text-[#212B36] rounded-xl font-bold"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Chiqarilmoqda...
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 mr-2" />
                    Chop etish
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>

        <ReceiptPreview
          order={order}
          open={showReceiptPreview}
          onClose={() => setShowReceiptPreview(false)}
        />
      </DialogContent>
    </Dialog>
  );
}