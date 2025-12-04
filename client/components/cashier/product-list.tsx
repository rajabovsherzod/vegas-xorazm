"use client";

import { Product } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, PackageOpen } from "lucide-react";
import { ProductCard } from "./product-card";

interface ProductListProps {
  products: Product[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cart: { product: Product; quantity: number }[];
  onAddToCart: (product: Product) => void;
  onDecreaseFromCart: (product: Product) => void;
  // 🔥 YANGI PROP
  onRemoveFromCart: (id: number) => void; 
}

export function ProductList({
  products,
  searchQuery,
  onSearchChange,
  cart,
  onAddToCart,
  onDecreaseFromCart,
  onRemoveFromCart, // Qabul qilamiz
}: ProductListProps) {
  
  const displayedProducts = searchQuery.trim() === "" 
    ? products.slice(0, 20) 
    : products;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-gray-50/95 dark:bg-[#0f1d20]/95 backdrop-blur-sm pb-2 pt-1 border-b border-gray-200/50 dark:border-white/5 mb-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Katalog
            </h2>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {products.length}
            </Badge>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Qidiruv..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 focus-visible:ring-[#00B8D9] rounded-lg"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
        {products.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground bg-gray-100/50 dark:bg-white/5 rounded-lg border border-dashed border-gray-200 dark:border-white/10">
            <PackageOpen className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">Baza bo'sh</p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-xs">Topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 pb-24">
            {displayedProducts.map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  inCart={!!cartItem}
                  cartQuantity={cartItem?.quantity}
                  onAdd={onAddToCart}
                  onDecrease={onDecreaseFromCart}
                  // 🔥 PASTGA UZATAMIZ
                  onRemove={() => onRemoveFromCart(product.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}