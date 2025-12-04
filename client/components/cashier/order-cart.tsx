"use client";

import { CartItem as CartItemComponent } from "./cart-item";
import { OrderInfoForm } from "@/components/cashier/order-info-form";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product } from "@/types/api";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ShoppingBag, 
  Save, 
  CreditCard
} from "lucide-react";

// 🔥 CartItem interfeysini yangilaymiz
export interface CartItem {
  product: Product;
  quantity: number;
  originalQuantity?: number; // DB dan kelgan dastlabki soni
}

interface OrderCartProps {
  cart: CartItem[];
  customerName: string;
  paymentMethod: "cash" | "card" | "transfer" | "debt";
  exchangeRate: string;
  totalAmount: number;
  totalUSD: number;
  onCustomerNameChange: (val: string) => void;
  onPaymentMethodChange: (val: "cash" | "card" | "transfer" | "debt") => void;
  onExchangeRateChange: (val: string) => void;
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  getStockError: (item: CartItem) => string | null;
  onSave: () => void;
  isSaving: boolean;
}

export function OrderCartFloating({
  cart,
  customerName,
  paymentMethod,
  exchangeRate,
  totalAmount,
  totalUSD,
  onCustomerNameChange,
  onPaymentMethodChange,
  onExchangeRateChange,
  onUpdateQuantity,
  onRemove,
  getStockError,
  onSave,
  isSaving,
}: OrderCartProps) {
  
  const itemsToDisplay = cart; 
  const activeItemCount = cart.filter(i => i.quantity > 0).length;

  if (cart.length === 0) return null;

  return (
    <Sheet>
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 animate-in slide-in-from-bottom-6 duration-500">
        <SheetTrigger asChild>
          <Button 
            className="w-full md:w-auto h-16 rounded-2xl shadow-2xl shadow-[#00B8D9]/30 bg-[#132326] hover:bg-[#0f1d20] text-white border border-white/10 flex items-center gap-6 px-2 pl-2 pr-8 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="h-12 w-12 rounded-xl bg-[#00B8D9] flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:bg-[#00a0bc] transition-colors">
              {activeItemCount}
            </div>
            <div className="flex flex-col items-start mr-4">
              <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider leading-tight">Jami summa</span>
              <span className="text-xl font-bold tracking-tight">{formatCurrency(totalAmount, "UZS")}</span>
            </div>
            <div className="flex items-center gap-2 text-[#00B8D9] font-bold text-sm uppercase tracking-wider pl-4 border-l border-white/10 h-8">
              Tasdiqlash
            </div>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[500px] p-0 flex flex-col h-full bg-white dark:bg-[#0B1215] border-l border-border"
      >
        <SheetHeader className="shrink-0 px-6 py-5 border-b border-border flex flex-row items-center justify-between bg-white dark:bg-[#132326] space-y-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="bg-[#00B8D9]/10 p-2 rounded-xl">
               <ShoppingBag className="w-5 h-5 text-[#00B8D9]" />
            </div>
            <div className="text-left">
              <SheetTitle className="text-lg font-bold text-gray-900 dark:text-white">Buyurtmani tahrirlash</SheetTitle>
              <p className="text-xs text-muted-foreground font-medium">Barcha o'zgarishlarni tekshiring</p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-hidden bg-gray-50/50 dark:bg-black/20">
          <ScrollArea className="h-full">
            <div className="p-5 space-y-6 pb-10">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Savatdagi mahsulotlar
                  </h3>
                  <span className="text-xs font-medium bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                    {activeItemCount} ta
                  </span>
                </div>
                
                <div className="space-y-2 bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
                  {itemsToDisplay.map((item) => {
                    // 🔥 HISOBLASH QISMI:
                    // Agar originalQuantity bor bo'lsa (ya'ni eski mahsulot), limit = stock + original
                    // Agar yangi qo'shilgan bo'lsa (original yo'q), limit = stock
                    const limit = Number(item.product.stock) + (item.originalQuantity || 0);

                    return (
                      <CartItemComponent
                        key={item.product.id}
                        product={item.product}
                        quantity={item.quantity}
                        stockError={getStockError(item)}
                        // 🔥 YANGI PROP: Max limitni uzatamiz
                        maxStock={limit}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                      />
                    );
                  })}
                </div>
              </div>

              {/* ... (Qolgan qismi o'zgarishsiz) ... */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                  Mijoz va To'lov
                </h3>
                <div className="bg-white dark:bg-[#132326] p-5 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-white/5">
                    <CreditCard className="w-4 h-4 text-[#00B8D9]" /> 
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">To'lov ma'lumotlari</h3>
                  </div>
                  <OrderInfoForm
                    customerName={customerName}
                    paymentMethod={paymentMethod}
                    exchangeRate={exchangeRate}
                    onCustomerNameChange={onCustomerNameChange}
                    onPaymentMethodChange={onPaymentMethodChange}
                    onExchangeRateChange={onExchangeRateChange}
                  />
                </div>
              </div>

            </div>
          </ScrollArea>
        </div>

        {/* ... (Footer o'zgarishsiz) ... */}
        <div className="shrink-0 p-6 bg-white dark:bg-[#132326] border-t border-gray-200 dark:border-white/5 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20">
          <div className="flex justify-between items-end mb-4">
             <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Yakuniy summa</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                     {formatCurrency(totalAmount, "UZS")}
                   </span>
                </div>
             </div>
             
             {totalUSD > 0 && (
                <div className="bg-[#00B8D9]/10 px-3 py-1.5 rounded-lg text-right">
                   <span className="text-[10px] font-bold text-[#00B8D9] uppercase block">Valyutada</span>
                   <span className="text-sm font-bold text-[#00B8D9]">
                      ${totalUSD.toFixed(2)}
                   </span>
                </div>
             )}
          </div>
          
          <Button 
              onClick={onSave} 
              disabled={isSaving}
              className={cn(
                "w-full h-14 text-base font-bold rounded-xl shadow-lg shadow-[#00B8D9]/25 transition-all",
                "bg-[#00B8D9] hover:bg-[#00a0bc] hover:shadow-[#00B8D9]/40 hover:-translate-y-0.5 active:translate-y-0"
              )}
          >
              {isSaving ? (
                "Saqlanmoqda..."
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  O'zgarishlarni saqlash
                </div>
              )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}