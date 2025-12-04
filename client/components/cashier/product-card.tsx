"use client";

import { Product } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Package, Ban, Trash2 } from "lucide-react"; // Trash2 import qilindi
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  inCart: boolean;
  cartQuantity?: number;
  onAdd: (product: Product) => void;
  onDecrease: (product: Product) => void;
  onRemove: () => void; // 🔥 YANGI: O'chirish funksiyasi
}

export function ProductCard({ 
  product, 
  inCart, 
  cartQuantity, 
  onAdd, 
  onDecrease,
  onRemove 
}: ProductCardProps) {
  const isLowStock = Number(product.stock) < 10;
  const isOutOfStock = Number(product.stock) === 0;

  // Karta ustiga bosilganda -> Qo'shish
  const handleCardClick = () => {
    if (isOutOfStock) {
      toast.warning("Ushbu mahsulot omborda qolmagan!");
      return;
    }
    onAdd(product);
  };

  // Minus tugmasi -> Kamaytirish
  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onDecrease(product);
  };

  // 🔥 Trash tugmasi -> Butunlay o'chirish
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(); // Savatdan olib tashlash
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer overflow-hidden border select-none",
        !isOutOfStock && "bg-white dark:bg-[#132326]",
        !isOutOfStock && !inCart && "border-gray-200 dark:border-white/5 hover:border-[#00B8D9]/50 hover:shadow-md",
        inCart && !isOutOfStock && "border-[#00B8D9] ring-1 ring-[#00B8D9]/20 shadow-sm",
        isOutOfStock && [
          "bg-gray-50 dark:bg-white/5",
          "border-dashed border-gray-300 dark:border-white/10",
          "opacity-60 hover:opacity-80"
        ]
      )}
    >
      {/* Top: Name & Stock */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className={cn(
            "font-semibold text-sm leading-tight line-clamp-2",
            isOutOfStock ? "text-gray-500" : "text-gray-900 dark:text-gray-100"
          )}>
            {product.name}
          </h3>
          
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border transition-colors",
            isOutOfStock 
              ? "bg-transparent border-gray-200 text-gray-400" 
              : isLowStock 
                ? "bg-amber-100/50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400"
                : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10"
          )}>
            {isOutOfStock ? <Ban className="w-3.5 h-3.5" /> : <Package className="w-3.5 h-3.5" />}
            <span>{product.stock} {product.unit}</span>
          </div>
        </div>

        {/* Quantity Badge */}
        {inCart && cartQuantity && !isOutOfStock && (
          <Badge className="bg-[#00B8D9] hover:bg-[#00B8D9] text-white px-2 h-6 text-xs shadow-sm animate-in zoom-in-50 rounded-lg">
            {cartQuantity}
          </Badge>
        )}
      </div>

      {/* Bottom: Price & Action Buttons */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
        <div className={cn(
          "font-bold text-sm",
          isOutOfStock ? "text-gray-400 decoration-slate-400 line-through" : "text-gray-900 dark:text-white"
        )}>
          {formatCurrency(Number(product.price), product.currency)}
        </div>
        
        {/* ACTIONS */}
        <div className="flex items-center gap-1">
          
          {/* MINUS BUTTON (Faqat savatda bor bo'lsa) */}
          {inCart && !isOutOfStock && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-gray-500 bg-gray-100 dark:bg-white/10 hover:text-gray-700 hover:bg-gray-200 dark:hover:bg-white/20 transition-all shadow-sm"
              onClick={handleDecrease}
              title="Bittaga kamaytirish"
            >
              <Minus className="w-4 h-4" />
            </Button>
          )}

          {/* 🔥 TRASH BUTTON (PLUS O'RNIGA, agar savatda bo'lsa) */}
          {inCart && !isOutOfStock && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 transition-all shadow-sm"
              onClick={handleRemove}
              title="Savatdan butunlay o'chirish"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          {/* Agar savatda bo'lmasa, hech narsa ko'rinmaydi (toza dizayn) */}
          {isOutOfStock && <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Qolmagan</span>}
        </div>
      </div>
    </div>
  );
}