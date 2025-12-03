"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";
import { orderService, CreateOrderPayload, OrderItem } from "@/lib/services/order.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Package,
  ChevronUp,
  TrendingUp
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { PosCart, CartItem } from "@/components/pos/pos-cart";
import { useUsdRate } from "@/providers/usd-rate-provider";

export default function POSPageClient() {
  const usdRate = useUsdRate();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "debt">("cash");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const usdRateNum = parseFloat(usdRate);

  // Mahsulotlar (real-time yangilanadi Socket.io orqali)
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res: any = await productService.getAll();
      return res?.products || res || [];
    },
  });

  // Kategoriyalar
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoryService.getAll();
      return Array.isArray(res) ? res : [];
    },
  });

  // Buyurtma yaratish mutation
  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.create(payload),
    onSuccess: () => {
      toast.success("Buyurtma yuborildi!", {
        description: "Admin tasdiqlashini kuting",
      });
      setCart([]);
      setCustomerName("");
      setIsCartOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  // Filtrlangan mahsulotlar
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesCategory =
        selectedCategory === "all" || product.categoryId === Number(selectedCategory);
      return matchesCategory && product.isActive && !product.isDeleted;
    });
  }, [products, selectedCategory]);

  // Savatchaga qo'shish
  const addToCart = (product: any) => {
    const existingItem = cart.find((item) => item.productId === product.id);
    const currentStock = Number(product.stock);

    if (existingItem) {
      if (existingItem.quantity >= currentStock) {
        toast.error("Omborda yetarli mahsulot yo'q");
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      if (currentStock < 1) {
        toast.error("Mahsulot ombordan tugagan");
        return;
      }
      
      // USD mahsulot bo'lsa, kursga ko'paytiramiz
      const isUSD = product.currency === 'USD';
      const priceInUZS = isUSD ? Number(product.price) * usdRateNum : Number(product.price);
      
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: priceInUZS,
          quantity: 1,
          stock: currentStock,
          barcode: product.barcode,
        },
      ]);
    }
  };

  // Miqdorni o'zgartirish
  const updateQuantity = (productId: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              toast.error("Omborda yetarli mahsulot yo'q");
              return item;
            }
            return { ...item, quantity: Math.max(0, newQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Savatchadan o'chirish
  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  // Jami summa
  const totalAmount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  // Jami mahsulot soni
  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Buyurtma yaratish
  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast.error("Savatcha bo'sh");
      return;
    }

    const items: OrderItem[] = cart.map((item) => ({
      productId: item.productId,
      quantity: String(item.quantity),
    }));

    const payload: CreateOrderPayload = {
      customerName: customerName || undefined,
      type: "retail",
      paymentMethod,
      exchangeRate: usdRate, // USD kursni yuboramiz
      items,
    };

    createOrderMutation.mutate(payload);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-80px)]">
      {/* Main Content - Products */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Categories Header */}
        <div className="p-3 md:p-4 bg-white dark:bg-[#132326] border-b border-gray-200 dark:border-white/10 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold text-[#212B36] dark:text-white">Mahsulotlar</h2>
            
            {/* USD Kurs ko'rsatkichi */}
            <div className="flex items-center gap-2 px-3 h-9 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">1 USD =</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  {usdRateNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "shrink-0 rounded-lg font-bold h-9",
                selectedCategory === "all" && "bg-[#00B8D9] hover:bg-[#00B8D9]/90"
              )}
            >
              Barchasi
            </Button>
            {categories.map((cat: any) => (
              <Button
                key={cat.id}
                variant={selectedCategory === String(cat.id) ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(String(cat.id))}
                className={cn(
                  "shrink-0 rounded-lg font-bold h-9",
                  selectedCategory === String(cat.id) && "bg-[#00B8D9] hover:bg-[#00B8D9]/90"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50/50 dark:bg-[#0D1B1E]">
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">Mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 pb-24 lg:pb-0">
              {filteredProducts.map((product: any) => {
                const inCart = cart.find((item) => item.productId === product.id);
                const stock = Number(product.stock);
                const isOutOfStock = stock < 1;
                const isUSD = product.currency === 'USD';
                const displayPrice = isUSD ? Number(product.price) * usdRateNum : Number(product.price);

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={cn(
                      "relative flex flex-col p-3 md:p-4 rounded-2xl border text-left transition-all group bg-white dark:bg-[#132326]",
                      "border-gray-100 dark:border-white/5 hover:border-[#00B8D9] hover:shadow-lg hover:-translate-y-1",
                      isOutOfStock && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none",
                      inCart && "ring-2 ring-[#00B8D9] ring-offset-2 dark:ring-offset-[#0D1B1E]"
                    )}
                  >
                    {inCart && (
                      <Badge className="absolute -top-2 -right-2 bg-[#00B8D9] h-6 min-w-6 flex items-center justify-center p-0 rounded-full shadow-lg border-2 border-white dark:border-[#0D1B1E] z-10">
                        {inCart.quantity}
                      </Badge>
                    )}
                    
                    <div className="flex-1 min-h-[3rem] mb-2">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-sm text-[#212B36] dark:text-white line-clamp-2 leading-snug flex-1">
                          {product.name}
                        </h4>
                        {isUSD && (
                          <Badge className="bg-emerald-500 text-white h-6 px-2 text-xs font-bold rounded shrink-0">
                            ${Number(product.price).toFixed(0)}
                          </Badge>
                        )}
                      </div>
                      {product.barcode && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-1 opacity-60">
                            {product.barcode}
                        </p>
                      )}
                    </div>

                    <div className="mt-auto pt-2 border-t border-gray-100 dark:border-white/5 w-full">
                        <p className="text-base md:text-lg font-extrabold text-[#00B8D9]">
                          {new Intl.NumberFormat("uz-UZ").format(displayPrice)}
                          <span className="text-[10px] font-normal text-muted-foreground ml-1">UZS</span>
                        </p>
                        <p className={cn(
                        "text-[10px] font-bold mt-1",
                        stock < 10 ? "text-rose-500" : "text-emerald-500"
                        )}>
                        {stock} dona mavjud
                        </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar Cart (Visible on Large Screens) */}
      <div className="hidden lg:flex w-[400px] xl:w-[450px] flex-col border-l border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326]">
        <PosCart 
          cart={cart}
          totalItems={totalItems}
          totalAmount={totalAmount}
          customerName={customerName}
          setCustomerName={setCustomerName}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          clearCart={() => setCart([])}
          onCheckout={handleCreateOrder}
          isPending={createOrderMutation.isPending}
        />
      </div>

      {/* Mobile Cart Trigger & Sheet */}
      <div className="lg:hidden">
        {/* Bottom Bar Trigger */}
        {cart.length > 0 && (
            <div className="fixed bottom-4 left-4 right-4 z-50">
                <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                    <SheetTrigger asChild>
                        <Button 
                            className="w-full h-16 rounded-2xl bg-[#00B8D9] text-white shadow-2xl shadow-[#00B8D9]/30 flex items-center justify-between px-6 hover:bg-[#00B8D9]/90 transition-all active:scale-95"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                    {totalItems}
                                </div>
                                <div className="flex flex-col items-start">
                                    <span className="text-xs opacity-80 font-medium uppercase tracking-wider">Jami summa</span>
                                    <span className="font-extrabold text-lg">
                                        {new Intl.NumberFormat("uz-UZ").format(totalAmount)} UZS
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-bold text-sm bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                Savatcha
                                <ChevronUp className="w-4 h-4" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-[2rem] overflow-hidden border-t-0">
                        <SheetTitle className="hidden">Savatcha</SheetTitle>
                        <div className="h-full bg-white dark:bg-[#132326]">
                            <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto my-3" />
                            <PosCart 
                              cart={cart}
                              totalItems={totalItems}
                              totalAmount={totalAmount}
                              customerName={customerName}
                              setCustomerName={setCustomerName}
                              paymentMethod={paymentMethod}
                              setPaymentMethod={setPaymentMethod}
                              updateQuantity={updateQuantity}
                              removeFromCart={removeFromCart}
                              clearCart={() => setCart([])}
                              onCheckout={handleCreateOrder}
                              isPending={createOrderMutation.isPending}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        )}
      </div>
    </div>
  );
}

