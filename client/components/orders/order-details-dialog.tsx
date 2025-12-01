"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/lib/services/order.service";
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
  MapPin,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  if (!order) return null;

  const payment = paymentMethodMap[order.paymentMethod] || paymentMethodMap.cash;
  const PaymentIcon = payment.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#1C2C30] border-none shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-gray-100 dark:border-white/10 pb-4">
          <DialogTitle className="flex items-center justify-between text-xl font-bold text-[#212B36] dark:text-white">
            <span className="flex items-center gap-2">
              Buyurtma #{order.id}
              <Badge variant="outline" className={cn(
                "ml-2 border",
                order.status === 'completed' ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400" :
                order.status === 'draft' ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400" :
                "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400"
              )}>
                {order.status === 'completed' ? "Yakunlangan" : order.status === 'draft' ? "Kutilmoqda" : "Bekor qilingan"}
              </Badge>
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Info Column */}
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

          {/* Items Column */}
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 h-full border border-gray-100 dark:border-white/5">
            <h4 className="font-bold text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Mahsulotlar ({order.items?.length || 0})
            </h4>
            <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm border-b border-gray-200 dark:border-white/10 pb-2 last:border-0 last:pb-0 last:border-b-0">
                  <div>
                    <p className="font-medium text-[#212B36] dark:text-white">{item.product?.name || "Mahsulot"}</p>
                    <p className="text-xs text-muted-foreground">
                      {Number(item.quantity)} x {new Intl.NumberFormat("uz-UZ").format(Number(item.price))}
                    </p>
                  </div>
                  <p className="font-bold text-[#212B36] dark:text-white">
                    {new Intl.NumberFormat("uz-UZ").format(Number(item.totalPrice))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-white/10 pt-4 mt-2 flex items-center justify-between">
          <p className="font-medium text-muted-foreground">Jami summa:</p>
          <p className="text-2xl font-extrabold text-[#212B36] dark:text-white">
            {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))} 
            <span className="text-sm font-normal text-muted-foreground ml-1">UZS</span>
          </p>
        </div>

        <DialogFooter className="sm:justify-between gap-2 mt-4">
           <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
             Yopish
           </Button>
           {order.status === "completed" && (
              <Button className="w-full sm:w-auto bg-[#212B36] dark:bg-white dark:text-[#212B36]">
                <Printer className="w-4 h-4 mr-2" />
                Chek chiqarish
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

