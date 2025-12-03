/**
 * Receipt Preview Component
 * 
 * Professional haqiqiy chek ko'rinishi
 */

"use client";

import { useRef, useEffect, useState } from "react";
import { orderService, Order } from "@/lib/services/order.service";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { printService } from "@/lib/services/print.service";
import { toast } from "sonner";
import Image from "next/image";
import { isMobileDevice } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface ReceiptPreviewProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptPreview({ order, open, onClose }: ReceiptPreviewProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Modal yopilganda state ni tozalash
  useEffect(() => {
    if (!open) {
      setIsPrinting(false);
      setShowMobileWarning(false);
    } else {
      // Modal ochilganda scroll ni yuqoriga qaytarish
      setTimeout(() => {
        const scrollContainer = receiptRef.current?.parentElement;
        if (scrollContainer) {
          scrollContainer.scrollTop = 0;
        }
      }, 100);
    }
  }, [open]);

  // Body scroll ni bloklash modal ochilganda
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);


  const handlePrint = async () => {
    if (!order) return;

    // Mobile qurilma bo'lsa, ogohlantirish
    if (isMobileDevice()) {
      setShowMobileWarning(true);
      return;
    }

    setIsPrinting(true);
    try {
      await printService.printReceipt(order);

      // Chek muvaffaqiyatli chiqsa, backendga xabar beramiz
      try {
        await orderService.markAsPrinted(order.id);
      } catch (e) {
        console.error("Chek statusini o'zgartirishda xatolik", e);
      }

      toast.success('Chek muvaffaqiyatli chiqarildi!');
    } catch (error: any) {
      toast.error(`Chek chiqarishda xatolik: ${error.message}`);
    } finally {
      setIsPrinting(false);
    }
  };

  if (!open || !order) return null;

  const paymentMethods: Record<string, string> = {
    cash: "Naqd",
    card: "Karta",
    transfer: "O'tkazma",
    debt: "Nasiya",
  };

  // USD items uchun to'g'ri hisob-kitob
  const usdItems = order.items?.filter((item: any) => item.originalCurrency === 'USD') || [];
  const uzsItems = order.items?.filter((item: any) => item.originalCurrency !== 'USD') || [];

  // USD total - faqat USD mahsulotlar uchun
  const totalUSD = usdItems.reduce((sum: number, item: any) => {
    // USD mahsulotning asl narxi (dollarda)
    const usdPrice = Number(item.price) / Number(order.exchangeRate);
    return sum + (usdPrice * Number(item.quantity));
  }, 0);

  // UZS total - faqat UZS mahsulotlar uchun
  const totalUZS = uzsItems.reduce((sum: number, item: any) => {
    return sum + Number(item.totalPrice);
  }, 0);

  // USD items dan UZS ga convert qilingan summa
  const usdItemsInUZS = usdItems.reduce((sum: number, item: any) => {
    return sum + Number(item.totalPrice);
  }, 0);

  // USD kurs
  const usdRate = order.exchangeRate
    ? new Intl.NumberFormat("uz-UZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(order.exchangeRate))
    : "0.00";

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

          {/* Receipt Content - Professional Haqiqiy Chek Formatida */}
          <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50 dark:bg-[#0D1B1E] scroll-smooth min-h-0">
            <div
              ref={receiptRef}
              className="bg-white text-black mx-auto p-4 md:p-6 font-mono text-xs shadow-lg"
              style={{
                width: '80mm',
                maxWidth: '80mm',
                margin: '0 auto',
                lineHeight: '1.4',
              }}
            >
              {/* Header - Center aligned with Logo */}
              <div className="text-center mb-4 border-b-2 border-black pb-3">
                {/* Logo - Full Rounded */}
                <div className="flex justify-center mb-2">
                  <Image
                    src="/logo.jpg"
                    alt="Logo"
                    width={60}
                    height={60}
                    className="object-cover rounded-full"
                    unoptimized
                  />
                </div>
              </div>

              {/* USD Kurs */}
              <div className="text-center mb-3 text-[10px] border-b border-dashed border-gray-300 pb-2">
                <span className="font-semibold">USD kursi: </span>
                <span className="font-bold">{usdRate} so'm</span>
              </div>

              {/* Order Info */}
              <div className="mb-4 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="font-semibold">Chek №:</span>
                  <span className="font-bold">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Sana:</span>
                  <span>{format(new Date(order.createdAt), "dd.MM.yyyy")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Vaqt:</span>
                  <span>{format(new Date(order.createdAt), "HH:mm")}</span>
                </div>
                {order.seller && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Sotuvchi:</span>
                    <span className="text-right max-w-[60%] break-words">
                      {order.seller.fullName || order.seller.username}
                    </span>
                  </div>
                )}
                {order.cashier && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Kassir:</span>
                    <span className="text-right max-w-[60%] break-words">
                      {order.cashier.fullName || order.cashier.username}
                    </span>
                  </div>
                )}
                {order.customerName && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Mijoz:</span>
                    <span className="text-right max-w-[60%] break-words">
                      {order.customerName}
                    </span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-400 my-3"></div>

              {/* Items Header */}
              <div className="mb-2 text-[10px] font-bold border-b border-gray-300 pb-1">
                <div className="grid grid-cols-12 gap-1">
                  <div className="col-span-6">Mahsulot</div>
                  <div className="col-span-2 text-center">Miq.</div>
                  <div className="col-span-4 text-right">Summa</div>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-3 space-y-2">
                {order.items?.map((item: any, index: number) => {
                  const isUSD = item.originalCurrency === 'USD';
                  // USD mahsulotning asl narxi (dollarda)
                  const usdPrice = isUSD
                    ? Number(item.price) / Number(order.exchangeRate)
                    : 0;
                  const quantity = Number(item.quantity);
                  const totalPrice = Number(item.totalPrice);
                  const productName = item.product?.name || "Mahsulot";

                  return (
                    <div key={index} className="text-[10px] border-b border-dashed border-gray-200 pb-2">
                      <div className="grid grid-cols-12 gap-1 mb-1">
                        <div className="col-span-6 font-medium leading-tight break-words">
                          {productName}
                        </div>
                        <div className="col-span-2 text-center">{quantity}</div>
                        <div className="col-span-4 text-right font-semibold">
                          {new Intl.NumberFormat("uz-UZ", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(totalPrice)} so'm
                        </div>
                      </div>
                      {isUSD && (
                        <div className="text-right text-[9px] text-gray-600 mt-0.5">
                          {quantity} x ${usdPrice.toFixed(2)} = ${(usdPrice * quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-400 my-3"></div>

              {/* Totals */}
              <div className="mb-3 space-y-1.5 text-[11px]">
                {/* USD items bo'lsa, ularni alohida ko'rsatish */}
                {usdItems.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-semibold">Jami (USD):</span>
                      <span className="font-bold">${totalUSD.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-600">
                      <span>({new Intl.NumberFormat("uz-UZ", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(usdItemsInUZS)} so'm)</span>
                    </div>
                  </>
                )}

                {/* UZS items bo'lsa */}
                {uzsItems.length > 0 && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Jami (UZS):</span>
                    <span className="font-bold">
                      {new Intl.NumberFormat("uz-UZ", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(totalUZS)} so'm
                    </span>
                  </div>
                )}

                {/* Umumiy summa */}
                <div className="flex justify-between text-sm font-bold border-t-2 border-black pt-2 mt-2">
                  <span>JAMI:</span>
                  <span>
                    {new Intl.NumberFormat("uz-UZ", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Number(order.finalAmount))} so'm
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-4 text-[11px] border-t border-dashed border-gray-400 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">To'lov usuli:</span>
                  <span className="font-bold">{paymentMethods[order.paymentMethod] || order.paymentMethod}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-6 pt-4 border-t-2 border-black">
                <p className="font-bold text-xs mb-1">RAHMAT!</p>
                <p className="text-[10px] text-gray-600">Qayta tashrif buyurganingiz uchun</p>
                <p className="text-[9px] text-gray-500 mt-2">
                  {format(new Date(order.createdAt), "dd.MM.yyyy HH:mm:ss")}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C2C30] flex justify-end gap-3 flex-shrink-0 z-10">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[100px]"
            >
              Yopish
            </Button>
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              className="min-w-[140px] bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white"
            >
              {isPrinting ? (
                <>
                  <Printer className="w-4 h-4 mr-2 animate-pulse" />
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
        </DialogContent>
      </Dialog>

      {/* Mobile Warning Dialog */}
      <AlertDialog open={showMobileWarning} onOpenChange={setShowMobileWarning}>
        <AlertDialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl max-w-sm mx-auto rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl font-bold text-amber-500">
              Diqqat!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center pt-2 text-[#212B36] dark:text-gray-300">
              Chekni chop etish faqat maxsus dasturiy ta'minot (QZ Tray) o'rnatilgan kompyuterlarda ishlaydi.
              <br /><br />
              Mobil qurilma yoki planshet orqali chop etish imkoniyati mavjud emas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={() => setShowMobileWarning(false)} className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto min-w-[120px]">
              Tushundim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
