"use client";

import { useRef, useEffect, useState } from "react";
import { orderService, Order } from "@/lib/services/order.service";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { printService } from "@/lib/services/print.service";
import { toast } from "sonner";
import Image from "next/image";
import { isMobileDevice, formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReceiptPreviewProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptPreview({ order, open, onClose }: ReceiptPreviewProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setIsPrinting(false);
      setShowMobileWarning(false);
    }
  }, [open]);

  const handlePrint = async () => {
    if (!order) return;
    if (isMobileDevice()) {
      setShowMobileWarning(true);
      return;
    }

    setIsPrinting(true);
    try {
      await printService.printReceipt(order);
      try { await orderService.markAsPrinted(order.id); } catch (e) { console.error(e); }
      toast.success('Chek chiqarildi!');
    } catch (error: any) {
      toast.error(`Xatolik: ${error.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!open || !order) return null;

  // 🔥 HISOBLASH MANTIQI (BETON V3)
  
  // 1. Asl Narxlar Yig'indisi (Haqiqiy katalog narxlari)
  const originalTotalAmount = Number(order.totalAmount); 

  // 2. Mahsulotlarning o'z yig'indisi (Item Discountlar ayirilgandan keyin)
  // Bu summa Global Discountdan oldingi summa (Subtotal)
  const itemsSubtotal = order.items?.reduce((sum, item) => sum + Number(item.totalPrice), 0) || 0;

  // 3. Umumiy Chegirma (Global Discount)
  const globalDiscountAmount = Number(order.discountAmount || 0);
  const globalDiscountValue = Number(order.discountValue || 0);
  const isPercent = order.discountType === 'percent';

  // 4. Yakuniy To'lov
  const finalPayable = Number(order.finalAmount);

  // 5. Mijoz JAMI qancha yutdi? (Item Discount + Global Discount)
  const totalSavings = originalTotalAmount - finalPayable;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl w-full max-h-[95vh] overflow-hidden p-0 bg-white dark:bg-[#1C2C30] flex flex-col">
          <DialogHeader className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-base md:text-lg font-semibold text-[#212B36] dark:text-white flex-1">
                Chek ko'rinishi - #{order.id}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* RECEIPT CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-100/50 dark:bg-[#0D1B1E] flex justify-center">
            <div
              ref={receiptRef}
              className="bg-white text-black p-4 shadow-xl"
              style={{
                width: '80mm',
                minHeight: '100mm',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '12px',
                lineHeight: '1.2',
              }}
            >
              {/* 1. HEADER */}
              <div className="text-center mb-2 pb-2 border-b border-dashed border-black">
                <div className="flex justify-center mb-2 grayscale">
                   <Image src="/white-logo.jpg" alt="Logo" width={50} height={50} className="object-contain" />
                </div>
                <p className="text-[10px]">Tel: +998 90 123 45 67</p>
              </div>

              {/* 2. INFO */}
              <div className="text-[10px] mb-2 border-b border-dashed border-black pb-2 space-y-1">
                <div className="flex justify-between"><span>Chek №:</span><span className="font-bold">#{order.id}</span></div>
                <div className="flex justify-between"><span>Sana:</span><span>{format(new Date(order.createdAt), "dd.MM.yyyy HH:mm")}</span></div>
                <div className="flex justify-between"><span>Sotuvchi:</span><span>{order.seller?.fullName || "Kassir"}</span></div>
                <div className="flex justify-between"><span>Mijoz:</span><span>{order.customerName || "Mijoz"}</span></div>
              </div>

              {/* 3. ITEMS TABLE */}
              <div className="text-[10px] font-bold border-b border-black pb-1 mb-1 grid grid-cols-12 gap-1">
                 <div className="col-span-6">Nom</div>
                 <div className="col-span-2 text-center">Miq.</div>
                 <div className="col-span-4 text-right">Summa</div>
              </div>

              <div className="space-y-2 mb-2 pb-2 border-b border-dashed border-black">
                {order.items?.map((item: any, i: number) => {
                   // Item calculations
                   const originalPrice = Number(item.originalPrice);
                   const soldPrice = Number(item.price);
                   const qty = Number(item.quantity);
                   const total = Number(item.totalPrice);
                   const hasDiscount = soldPrice < originalPrice;

                   return (
                     <div key={i} className="text-[10px]">
                        <div className="font-bold mb-0.5">{item.product?.name}</div>
                        <div className="grid grid-cols-12 gap-1">
                           <div className="col-span-6 text-[9px] text-gray-600">
                              {hasDiscount ? (
                                <div className="flex flex-col leading-none">
                                   <span className="line-through decoration-1">{formatCurrency(originalPrice, "UZS")}</span>
                                   <span className="font-bold">{formatCurrency(soldPrice, "UZS")}</span>
                                </div>
                              ) : (
                                <span>{formatCurrency(soldPrice, "UZS")}</span>
                              )}
                           </div>
                           <div className="col-span-2 text-center">{qty}</div>
                           <div className="col-span-4 text-right font-bold">
                              {formatCurrency(total, "UZS")}
                           </div>
                        </div>
                     </div>
                   );
                })}
              </div>

              {/* 4. 🔥 TOTALS (BETON LOGIKA) */}
              <div className="text-[11px] space-y-1 mb-2">
                 
                 {/* A. ORALIQ JAMI (Items Total) */}
                 <div className="flex justify-between font-medium">
                    <span>Jami:</span>
                    <span>{formatCurrency(itemsSubtotal, "UZS")}</span>
                 </div>
                 
                 {/* B. UMUMIY CHEGIRMA (Global Discount) */}
                 {globalDiscountAmount > 0 && (
                   <div className="flex justify-between font-bold text-black">
                      <span>
                        Chegirma 
                        {isPercent && ` (${globalDiscountValue}%)`}
                        :
                      </span>
                      <span>-{formatCurrency(globalDiscountAmount, "UZS")}</span>
                   </div>
                 )}

                 {/* C. YAKUNIY TO'LOV */}
                 <div className="flex justify-between text-sm font-black border-t-2 border-black pt-2 mt-1 uppercase">
                    <span>TO'LOV:</span>
                    <span>{formatCurrency(finalPayable, "UZS")}</span>
                 </div>

                 {/* D. TEJALGAN MABLAG' (ITEM + GLOBAL) */}
                 {totalSavings > 0 && (
                    <div className="text-center text-[10px] font-bold mt-2 pt-1 border-t border-dashed border-gray-400">
                       JAMI TEJALALGAN SUMMA:  <span className="text-base">{formatCurrency(totalSavings, "UZS")}</span> 
                    </div>
                 )}
              </div>

              {/* 5. FOOTER */}
              <div className="text-center text-[9px] mt-4">
                 <p className="font-bold mb-1">XARIDINGIZ UCHUN RAHMAT!</p>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C2C30] flex justify-end gap-3 flex-shrink-0 z-10">
            <Button variant="outline" onClick={onClose}>Yopish</Button>
            <Button onClick={handlePrint} disabled={isPrinting} className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white min-w-[140px]">
              {isPrinting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Chiqarilmoqda...</> : <><Printer className="w-4 h-4 mr-2"/> Chop etish</>}
            </Button>
          </div>

        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showMobileWarning} onOpenChange={setShowMobileWarning}>
         {/* ... Mobile Warning (o'zgarishsiz) ... */}
      </AlertDialog>
    </>
  );
}