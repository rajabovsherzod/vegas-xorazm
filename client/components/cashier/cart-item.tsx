"use client";

import { useState } from "react";
import { Product } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface CartItemProps {
  product: Product;
  quantity: number;
  stockError: string | null;
  // 🔥 YANGI PROP: Aniq hisoblangan maksimal limit
  maxStock?: number; 
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartItem({
  product,
  quantity,
  stockError,
  maxStock, // Qabul qildik
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const [isFocused, setIsFocused] = useState(false);

  const totalPrice = Number(product.price) * quantity;
  
  // 🔥 MUHIM: Agar maxStock berilgan bo'lsa o'shani olamiz, bo'lmasa product.stock ni
  const effectiveStock = maxStock !== undefined ? maxStock : Number(product.stock);
  
  const isMaxedOut = quantity >= effectiveStock;

  // Ogohlantirish faqat limitga yetganda va fokusda
  const showWarning = isMaxedOut && isFocused;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === "") {
      onUpdateQuantity(product.id, 0);
      return;
    }

    let val = parseInt(inputValue);
    if (isNaN(val)) return;

    // 🔥 effectiveStock bilan tekshiramiz
    if (val > effectiveStock) {
      val = effectiveStock;
    }

    onUpdateQuantity(product.id, val);
  };

  return (
    <div className={cn(
      "group flex flex-col gap-2 py-3 px-3 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors",
      showWarning && "bg-orange-50/30 dark:bg-orange-900/10"
    )}>
      <div className="flex items-center justify-between gap-3">
        {/* INFO */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {product.name}
            </h4>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[11px] text-muted-foreground font-medium">
              {formatCurrency(Number(product.price), product.currency)}
            </p>
            
            {showWarning && (
              <span className="text-[10px] text-orange-600 bg-orange-100 px-1 rounded animate-in fade-in zoom-in duration-200">
                Maks: {effectiveStock}
              </span>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={cn(
            "flex items-center h-8 bg-white dark:bg-transparent border rounded-lg overflow-hidden shadow-sm transition-all duration-200",
            showWarning
              ? "border-orange-300 ring-2 ring-orange-100 dark:border-orange-500/50 dark:ring-orange-900/20" 
              : "border-gray-200 dark:border-white/10 hover:border-[#00B8D9]"
          )}>
            <button
              onClick={() => {
                if (quantity > 1) onUpdateQuantity(product.id, quantity - 1);
                else onRemove(product.id);
              }}
              className="w-8 h-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 border-r border-gray-100 dark:border-white/5"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            
            <input
              className={cn(
                "w-10 h-full text-center text-sm font-bold bg-transparent border-none focus:outline-none p-0 appearance-none selection:bg-[#00B8D9]/20",
                showWarning ? "text-orange-600" : "text-gray-900 dark:text-white",
                quantity === 0 && "text-gray-400"
              )}
              value={quantity === 0 ? "" : quantity}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="0"
            />

            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className={cn(
                "w-8 h-full flex items-center justify-center border-l border-gray-100 dark:border-white/5 transition-colors",
                isMaxedOut 
                  ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400" 
                  : "hover:bg-gray-100 text-[#00B8D9]"
              )}
              disabled={isMaxedOut}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-right w-[80px]">
            <p className={cn(
              "text-sm font-bold",
              quantity === 0 ? "text-gray-300" : "text-gray-900 dark:text-white"
            )}>
              {formatCurrency(totalPrice, product.currency)}
            </p>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onRemove(product.id)}
            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}