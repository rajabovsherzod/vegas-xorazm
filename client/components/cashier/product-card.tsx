"use client";

import { Product } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Package, Ban, Trash2, Tag } from "lucide-react"; 
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  inCart: boolean;
  cartQuantity?: number;
  onAdd: (product: Product) => void;
  onDecrease: (product: Product) => void;
  onRemove: () => void;
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
  const isOutOfStock = Number(product.stock) <= 0;

  // Chegirma Mantiqi
  const hasDiscount = product.discountPrice && Number(product.discountPrice) > 0;
  const currentPrice = hasDiscount ? Number(product.discountPrice) : Number(product.price);
  const oldPrice = Number(product.price);

  const handleCardClick = () => {
    if (isOutOfStock) {
      toast.warning("Mahsulot qolmagan!");
      return;
    }
    onAdd(product);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onDecrease(product);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative flex flex-col justify-between p-3 rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden border select-none h-full",
        !isOutOfStock && "bg-white dark:bg-[#132326]",
        !isOutOfStock && !inCart && "border-gray-200 dark:border-white/5 hover:border-[#00B8D9]/50 hover:shadow-md",
        inCart && !isOutOfStock && "border-[#00B8D9] ring-1 ring-[#00B8D9]/20 shadow-sm bg-[#00B8D9]/5",
        isOutOfStock && [
          "bg-gray-50 dark:bg-white/5",
          "border-dashed border-gray-300 dark:border-white/10",
          "opacity-60 hover:opacity-80"
        ]
      )}
    >
      {/* 🔥 AKSIYA BADGE (AMBER) */}
      {hasDiscount && !isOutOfStock && (
        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-xl z-10 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3" />
            Aksiya
          </div>
        </div>
      )}

      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className={cn(
            "font-bold text-sm leading-tight line-clamp-2",
            isOutOfStock ? "text-gray-500" : "text-gray-900 dark:text-gray-100"
          )}>
            {product.name}
          </h3>
          
          <div className={cn(
            "inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border transition-colors",
            isOutOfStock 
              ? "bg-transparent border-gray-200 text-gray-400" 
              : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border-transparent"
          )}>
            {isOutOfStock ? <Ban className="w-3 h-3" /> : <Package className="w-3 h-3" />}
            <span>{product.stock} {product.unit}</span>
          </div>
        </div>

        {inCart && cartQuantity && !isOutOfStock && (
          <Badge className="bg-[#00B8D9] hover:bg-[#00B8D9] text-white px-2 h-6 text-xs shadow-sm mt-6 animate-in zoom-in">
            {cartQuantity}
          </Badge>
        )}
      </div>

      <div className="flex items-end justify-between mt-auto pt-2 border-t border-gray-100 dark:border-white/5">
        <div className="flex flex-col">
          {/* 🔥 ESKI NARX (AMBER CHIZIQ) */}
          {hasDiscount && (
            <span className="text-[10px] text-gray-400 line-through decoration-amber-500/60 decoration-1 font-medium mb-[-2px]">
              {formatCurrency(oldPrice, product.currency)}
            </span>
          )}
          
          {/* YANGI NARX */}
          <div className={cn(
            "font-bold text-sm",
            isOutOfStock ? "text-gray-400" : (hasDiscount ? "text-amber-500" : "text-gray-900 dark:text-white")
          )}>
            {formatCurrency(currentPrice, product.currency)}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {inCart && !isOutOfStock && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-white/10"
                onClick={handleDecrease}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                onClick={handleRemove}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}