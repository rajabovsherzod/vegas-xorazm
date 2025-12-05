"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, Tag, Percent } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CartItemProps {
  product: Product;
  quantity: number;
  stockError: string | null;
  maxStock?: number; 
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  onUpdatePrice?: (productId: number, newPrice: number) => void;
  
  // 🔥 Ruxsat bormi? (Sellerda false bo'ladi)
  canDiscount?: boolean; 
}

export function CartItem({
  product,
  quantity,
  stockError,
  maxStock,
  onUpdateQuantity,
  onRemove,
  onUpdatePrice,
  canDiscount = false,
}: CartItemProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // --- NARXLAR LOGIKASI ---
  // 1. Agar backenddan discountPrice kelsa > 0, demak aksiya bor
  const hasDiscount = Number(product.discountPrice) > 0;
  
  // 2. Hozirgi sotiladigan narx (Aksiya yoki Asl)
  const currentPrice = hasDiscount ? Number(product.discountPrice) : Number(product.price);
  
  // 3. Asl narx (O'zgarmas, baza)
  const originalPrice = Number(product.price);
  
  const totalPrice = currentPrice * quantity;
  const effectiveStock = maxStock !== undefined ? maxStock : Number(product.stock);
  const isMaxedOut = quantity >= effectiveStock;
  const showWarning = isMaxedOut && isFocused;

  // --- MANUAL DISCOUNT STATE (FOIZ) ---
  const [discountPercent, setDiscountPercent] = useState("");

  // Popover ochilganda, agar oldin foiz bo'lsa hisoblab qo'yamiz (ixtiyoriy)
  useEffect(() => {
    if (popoverOpen && hasDiscount && originalPrice > 0) {
      // (Eski - Yangi) / Eski * 100
      const diff = originalPrice - currentPrice;
      const percent = (diff / originalPrice) * 100;
      // Agar foiz butun bo'lmasa, 2 xona qoldiramiz. Agar butun bo'lsa (masalan 10), butun qoladi.
      // Math.round ishlatish ham mumkin, lekin aniqlik uchun toFixed yaxshi.
      if (percent > 0) {
          // Agar 10.00 bo'lsa 10 ga aylantirish uchun parseFloat
          setDiscountPercent(parseFloat(percent.toFixed(2)).toString());
      }
    } else if (!popoverOpen) {
      setDiscountPercent(""); // Yopilganda tozalash
    }
  }, [popoverOpen, hasDiscount, originalPrice, currentPrice]);

  const handleDiscountSubmit = () => {
    const percent = parseFloat(discountPercent);

    // Validatsiya: Faqat raqam, 0-100 oralig'ida
    if (!isNaN(percent) && percent >= 0 && percent <= 100 && onUpdatePrice) {
      
      // 🔥 FORMULA: Yangi Narx = Asl Narx - (Asl Narx * Foiz / 100)
      const discountAmount = originalPrice * (percent / 100);
      const newPrice = originalPrice - discountAmount;
      
      // Biz "Yangi Narx"ni yuboramiz (Backend shuni kutadi)
      onUpdatePrice(product.id, newPrice);
      
      setPopoverOpen(false);
      setDiscountPercent(""); 
    }
  };

  // --- QUANTITY INPUT (NAN FIX) ---
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    // Agar input bo'sh bo'lsa, 0 ga tushirmaymiz (yozishga xalaqit beradi),
    // lekin state update qilganda ehtiyot bo'lamiz.
    if (val === "") {
      onUpdateQuantity(product.id, 0); 
      return;
    }

    const parsed = parseInt(val);
    if (!isNaN(parsed)) {
      // Limitdan oshib ketmasligi kerak
      const validQty = parsed > effectiveStock ? effectiveStock : parsed;
      onUpdateQuantity(product.id, validQty);
    }
  };

  return (
    <div className={cn(
      "group flex flex-col gap-2 py-3 px-3 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors relative",
      // Ogohlantirish foni (faqat limitga yetganda)
      showWarning && "bg-orange-50/30 dark:bg-orange-900/10"
    )}>
      <div className="flex items-center justify-between gap-3">
        
        {/* 1. INFO: NOM VA NARX */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {product.name}
          </h4>
          
          <div className="flex items-center gap-2 mt-0.5">
            {hasDiscount ? (
              <div className="flex items-center gap-1.5">
                {/* Eski narx (Chizilgan, kulrang) */}
                <span className="text-[10px] text-muted-foreground line-through decoration-rose-500/50 decoration-1">
                  {formatCurrency(originalPrice, product.currency)}
                </span>
                {/* Yangi narx (Feruz/Teal, qalin) */}
                <p className="text-[11px] font-bold text-[#00B8D9]">
                  {formatCurrency(currentPrice, product.currency)}
                </p>
              </div>
            ) : (
              // Oddiy holat
              <p className="text-[11px] text-muted-foreground font-medium">
                {formatCurrency(originalPrice, product.currency)}
              </p>
            )}
            
            {showWarning && (
              <span className="text-[10px] text-orange-600 bg-orange-100 px-1 rounded animate-in fade-in zoom-in">
                Maks: {effectiveStock}
              </span>
            )}
          </div>
        </div>

        {/* 2. CONTROLS: COUNTER & ACTIONS */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* COUNTER */}
          <div className={cn(
            "flex items-center h-8 bg-white dark:bg-transparent border rounded-lg overflow-hidden shadow-sm transition-all w-[100px]",
            showWarning ? "border-orange-300 ring-1 ring-orange-200" : "border-gray-200 dark:border-white/10 hover:border-[#00B8D9]"
          )}>
            <button
              onClick={() => quantity > 1 ? onUpdateQuantity(product.id, quantity - 1) : onRemove(product.id)}
              className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 border-r border-gray-100 dark:border-white/5 active:bg-gray-200"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            
            {/* Input: Faqat raqam, strelkalar yo'q, transparent */}
            <input
              type="number"
              className="w-full h-full text-center text-sm font-bold bg-transparent border-none focus:outline-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-white"
              value={quantity || ""} 
              onChange={handleQuantityChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="0"
            />

            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="w-8 h-full flex items-center justify-center border-l border-gray-100 dark:border-white/5 hover:bg-gray-100 text-[#00B8D9] active:bg-gray-200"
              disabled={isMaxedOut}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* JAMI NARX */}
          <div className="text-right w-[70px] hidden sm:block">
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalPrice, product.currency)}
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-1">
            
            {/* 1. CHEGIRMA (Faqat ruxsat bo'lsa) */}
            {canDiscount && (
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                      "h-8 w-8 rounded-lg transition-colors",
                      // Agar chegirma bo'lsa, icon rangi o'zgaradi
                      hasDiscount ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" : "text-gray-400 hover:text-[#00B8D9] hover:bg-[#00B8D9]/10"
                    )}
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3 bg-white dark:bg-[#1C2C30] border-gray-200 dark:border-white/10 shadow-xl rounded-xl z-[9999]" align="end">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                       <h4 className="font-bold text-xs text-[#00B8D9] uppercase tracking-wide">Chegirma (%)</h4>
                    </div>
                    
                    <div className="flex gap-2 relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Percent className="w-3.5 h-3.5" />
                      </div>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="h-9 text-sm bg-gray-50 dark:bg-black/20 pl-9 rounded-lg focus:ring-[#00B8D9]"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleDiscountSubmit()}
                        min={0}
                        max={100}
                      />
                      <Button 
                        size="sm" 
                        onClick={handleDiscountSubmit}
                        className="h-9 bg-[#00B8D9] hover:bg-[#00a0bc] text-white rounded-lg shadow-sm font-bold px-3"
                      >
                        OK
                      </Button>
                    </div>
                    {/* Preview */}
                    {discountPercent && (
                        <p className="text-[10px] text-muted-foreground text-right">
                           ≈ {formatCurrency(originalPrice * (Number(discountPercent)/100), product.currency)} chegirma
                        </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* 2. O'CHIRISH (Trash) */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove(product.id)}
              className="h-8 w-8 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}