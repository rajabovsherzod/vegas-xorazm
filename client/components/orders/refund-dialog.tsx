"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/lib/services/order.service";
import { Order } from "@/types/api";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, RotateCcw } from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface RefundDialogProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ order, open, onOpenChange }: RefundDialogProps) {
  const [refunds, setRefunds] = useState<Record<number, number>>({});
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();

  // 1. Order yo'q bo'lsa yoki items bo'lmasa, dialog bo'sh qaytadi (xato bermaydi)
  const items = order?.items || [];

  // 2. Jami summani hisoblash (useMemo bilan optimallashtiramiz va xavfsiz qilamiz)
  const totalRefundAmount = useMemo(() => {
    try {
      return items.reduce((acc, item: any) => {
        const qty = refunds[item.productId] || 0;
        
        // Narx va sonini xavfsiz raqamga o'tkazamiz
        const total = Number(item.totalPrice) || 0;
        const quantity = Number(item.quantity) || 1; // 0 ga bo'linmasligi uchun 1 oldik
        
        const unitPrice = total / quantity;
        return acc + (qty * unitPrice);
      }, 0);
    } catch (e) {
      console.error("Refund hisoblashda xato:", e);
      return 0;
    }
  }, [items, refunds]);

  // Input o'zgarganda
  const handleQtyChange = (productId: number, maxQty: number, val: string) => {
    // Faqat raqam ekanligini tekshiramiz
    const numVal = Number(val);
    if (isNaN(numVal)) return;

    const qty = Math.min(Math.max(0, numVal), maxQty);
    setRefunds((prev) => ({ ...prev, [productId]: qty }));
  };

  // Hammasini tanlash
  const handleSelectAll = () => {
    const all: Record<number, number> = {};
    items.forEach((item: any) => {
      all[item.productId] = Number(item.quantity);
    });
    setRefunds(all);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!order) return;

      const itemsToRefund = Object.entries(refunds)
        .filter(([_, qty]) => qty > 0)
        .map(([productId, qty]) => ({
          productId: Number(productId),
          quantity: qty,
        }));

      if (itemsToRefund.length === 0) throw new Error("Qaytarish uchun mahsulot tanlanmagan");

      return await orderService.refund(order.id, {
         items: itemsToRefund,
         reason: reason
      });
    },
    onSuccess: () => {
      toast.success("Mahsulotlar muvaffaqiyatli qaytarildi");
      onOpenChange(false);
      setRefunds({});
      setReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-order"] }); 
      queryClient.invalidateQueries({ queryKey: ["orders"] }); 
    },
    onError: (err: any) => {
      toast.error(err.message || "Xatolik yuz berdi");
    },
  });

  // Agar order bo'lmasa, hech narsa chizmaymiz
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1C2C30]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/20 rounded-lg">
              <RotateCcw className="w-5 h-5 text-rose-600" />
            </div>
            Mahsulotlarni qaytarish (Refund)
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Qaytariladigan mahsulotlar sonini kiriting:
            </p>
            <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs h-8">
              Hammasini tanlash
            </Button>
          </div>

          {/* TABLE */}
          <div className="border rounded-xl overflow-hidden mb-6 max-h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-white/5 sticky top-0">
                <tr>
                  <th className="p-3 text-left font-medium">Mahsulot</th>
                  <th className="p-3 text-center font-medium">Sotilgan</th>
                  <th className="p-3 text-center font-medium w-[100px]">Qaytarish</th>
                  <th className="p-3 text-right font-medium">Summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {items.map((item: any) => {
                  // Xavfsiz hisob-kitob
                  const total = Number(item.totalPrice) || 0;
                  const qty = Number(item.quantity) || 1;
                  const unitPrice = total / qty;
                  
                  const refundQty = refunds[item.productId] || 0;
                  
                  // Mahsulot nomini xavfsiz olish
                  const productName = item.product?.name || item.productName || "Noma'lum mahsulot";

                  return (
                    <tr key={item.id}>
                      <td className="p-3">
                        <div className="font-medium text-[#212B36] dark:text-white">
                          {productName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(unitPrice)} / dona
                        </div>
                      </td>
                      <td className="p-3 text-center">{qty}</td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={qty}
                          value={refundQty === 0 ? "" : refundQty}
                          placeholder="0"
                          onChange={(e) => handleQtyChange(item.productId, qty, e.target.value)}
                          className="h-8 w-16 text-center mx-auto"
                        />
                      </td>
                      <td className="p-3 text-right font-bold text-rose-600">
                        {formatCurrency(refundQty * unitPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* REASON & TOTAL */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Sabab (ixtiyoriy)</Label>
              <Textarea 
                placeholder="Nega qaytarilyapti? (Masalan: Yaroqsiz, Mijoz xohlamadi...)" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none h-20"
              />
            </div>

            <div className="bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl flex justify-between items-center border border-rose-100 dark:border-rose-900/20">
              <span className="font-bold text-rose-900 dark:text-rose-100">Jami qaytarish:</span>
              <span className="text-2xl font-extrabold text-rose-600">
                {formatCurrency(totalRefundAmount)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending || totalRefundAmount === 0}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6"
          >
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Tasdiqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}