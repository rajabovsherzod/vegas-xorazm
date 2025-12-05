"use client";

import { useMemo } from "react";
import { CartItem as CartItemComponent } from "./cart-item";
import { OrderInfoForm } from "./order-info-form";
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
  CreditCard,
  Percent
} from "lucide-react";

export interface CartItem {
  product: Product;
  quantity: number;
  originalQuantity?: number; 
  manualDiscountValue?: number;
  manualDiscountType?: 'percent' | 'fixed';
}

interface OrderCartProps {
  cart: CartItem[];
  customerName: string;
  paymentMethod: "cash" | "card" | "transfer" | "debt";
  exchangeRate: string;
  
  // Asosiy summalar
  totalAmount: number;         // Hozirgi (Chegirmali) summa
  originalTotalAmount: number; // Asl (Chegirmasiz) summa
  totalUSD: number;
  
  onCustomerNameChange: (val: string) => void;
  onPaymentMethodChange: (val: "cash" | "card" | "transfer" | "debt") => void;
  onExchangeRateChange: (val: string) => void;
  
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  onUpdatePrice: (id: number, price: number) => void; 
  
  // 🔥 CHEGIRMA PROPLARI
  discountAmount: number; 
  discountValue: number;            
  discountType: 'percent' | 'fixed'; 
  onDiscountApply: (amount: number, value: number, type: 'percent' | 'fixed') => void;
  
  canDiscount?: boolean;
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
  originalTotalAmount,
  totalUSD,
  
  onCustomerNameChange,
  onPaymentMethodChange,
  onExchangeRateChange,
  onUpdateQuantity,
  onRemove,
  onUpdatePrice,      
  
  discountAmount,     
  discountValue,      
  discountType,       
  onDiscountApply,    
  
  canDiscount = false,
  getStockError,
  onSave,
  isSaving,
}: OrderCartProps) {
  
  const itemsToDisplay = cart; 
  const activeItemCount = cart.filter(i => i.quantity > 0).length;

  // 1. YAKUNIY TO'LANADIGAN SUMMA
  // (Sotuv narxidan - Umumiy chegirmani ayiramiz)
  const finalTotal = Math.max(0, totalAmount - discountAmount);

  // 🔥 2. BETON FIX: CHIZILADIGAN NARX (STRIKE PRICE)
  // Oldingi xato: "hasGlobalDiscount ? totalAmount : originalTotalAmount" edi.
  // Yangi mantiq: Har doim eng katta ASL narxni ko'rsatamiz.
  // Agar originalTotalAmount 0 bo'lib qolsa (xatolik bo'lsa), totalAmount ni olamiz.
  const strikePrice = originalTotalAmount > 0 ? originalTotalAmount : totalAmount;

  // 3. Chizilgan narxni qachon ko'rsatamiz?
  // Agar "Chizilgan narx" > "To'lanadigan narx" dan katta bo'lsa (10 so'm farq bilan)
  const showStrikePrice = (strikePrice - finalTotal) > 10;
  
  // 4. Umumiy chegirma bormi? (Badgeda ko'rsatish uchun)
  const hasGlobalDiscount = discountAmount > 0;

  if (cart.length === 0) return null;

  return (
    <Sheet>
      {/* FLOATING BUTTON (Pastdagi tugma) */}
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
              <span className="text-xl font-bold tracking-tight">
                {formatCurrency(finalTotal, "UZS")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#00B8D9] font-bold text-sm uppercase tracking-wider pl-4 border-l border-white/10 h-8">
              Tasdiqlash
            </div>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent 
        side="right" 
        className="w-full sm:max-w-[600px] p-0 flex flex-col h-full bg-white dark:bg-[#0B1215] border-l border-border"
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
              
              {/* MAHSULOTLAR RO'YXATI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Savatdagi mahsulotlar</h3>
                  <span className="text-xs font-medium bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">{activeItemCount} ta</span>
                </div>
                <div className="space-y-0 bg-white dark:bg-[#132326] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
                  {itemsToDisplay.map((item) => {
                    const limit = Number(item.product.stock) + (item.originalQuantity || 0);
                    return (
                      <CartItemComponent
                        key={item.product.id}
                        product={item.product}
                        quantity={item.quantity}
                        stockError={getStockError(item)}
                        maxStock={limit}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                        onUpdatePrice={onUpdatePrice}
                        canDiscount={canDiscount}
                      />
                    );
                  })}
                </div>
              </div>

              {/* MIJOZ VA TO'LOV FORM (OrderInfoForm) */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Mijoz va To'lov</h3>
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
                    
                    discountAmount={discountAmount}
                    discountValue={discountValue}
                    discountType={discountType}     
                    onDiscountApply={onDiscountApply} 
                    
                    subTotal={totalAmount} 
                    canDiscount={canDiscount}
                  />
                </div>
              </div>

            </div>
          </ScrollArea>
        </div>

        {/* SHEET FOOTER (YAKUNIY SUMMA) */}
        <div className="shrink-0 p-6 bg-white dark:bg-[#132326] border-t border-gray-200 dark:border-white/5 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20">
          <div className="flex justify-between items-end mb-4">
             <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Yakuniy summa</span>
                <div className="flex items-baseline gap-2">
                   {/* 1. Final Narx (Eng oxirgi to'lanadigan) */}
                   <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                     {formatCurrency(finalTotal, "UZS")}
                   </span>
                   
                   {/* 2. Eski Narx (Eng katta asl narx) - Endi har doim to'g'ri chiqadi */}
                   {showStrikePrice && (
                     <span className="text-sm text-muted-foreground line-through decoration-rose-500/50">
                        {formatCurrency(strikePrice, "UZS")}
                     </span>
                   )}
                </div>
                
                {/* Global Chegirma Info */}
                {hasGlobalDiscount && (
                   <span className="text-[11px] font-bold text-[#00B8D9] mt-0.5 flex items-center gap-1">
                      <Percent className="w-3 h-3" /> 
                      Chegirma: -{formatCurrency(discountAmount, "UZS")}
                   </span>
                )}
             </div>
             
             {totalUSD > 0 && (
                <div className="bg-[#00B8D9]/10 px-3 py-1.5 rounded-lg text-right">
                   <span className="text-[10px] font-bold text-[#00B8D9] uppercase block">Valyutada</span>
                   <span className="text-sm font-bold text-[#00B8D9]">${totalUSD.toFixed(2)}</span>
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
              {isSaving ? "Saqlanmoqda..." : <div className="flex items-center gap-2"><Save className="w-5 h-5" /> O'zgarishlarni saqlash</div>}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}