"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { orderService } from "@/lib/services/order.service";
import { toast } from "sonner";
import { Product } from "@/types/api"; // Type import
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// 🔥 BIZ YARATGAN MUKAMMAL KOMPONENTLAR:
import { ProductList } from "@/components/cashier/product-list";
import { OrderCartFloating, CartItem } from "@/components/cashier/order-cart";
import { useUsdRate } from "@/providers/usd-rate-provider"; // Agar sizda bu provider bo'lsa

export default function POSPageClient() {
  const queryClient = useQueryClient();
  
  // Tizimdagi aktual kursni olamiz (agar provider bo'lsa)
  const systemRate = useUsdRate ? useUsdRate() : "12800"; 

  // --- STATES ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "debt">("cash");
  const [exchangeRate, setExchangeRate] = useState(systemRate);
  const [searchQuery, setSearchQuery] = useState("");

  // Kurs o'zgarsa statega ham yangilab qo'yamiz (ixtiyoriy)
  useEffect(() => {
    if (systemRate) setExchangeRate(systemRate);
  }, [systemRate]);

  // --- DATA FETCHING ---
  const { data: productsResponse, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll({ limit: 1000 }),
    // POS sahifasida mahsulotlar doim yangi bo'lishi kerak
    staleTime: 1000 * 60 * 5, // 5 daqiqa keshda tursin (tez ishlashi uchun)
  });

  const products = useMemo(() => {
    if (!productsResponse) return [];
    if (Array.isArray(productsResponse)) return productsResponse;
    if ((productsResponse as any).products) return (productsResponse as any).products;
    if ((productsResponse as any).data) {
      return Array.isArray((productsResponse as any).data) 
        ? (productsResponse as any).data 
        : (productsResponse as any).data.data;
    }
    return [];
  }, [productsResponse]);

  // --- MUTATION: CREATE ORDER ---
  const createOrderMutation = useMutation({
    mutationFn: () => {
      const validItems = cart.filter(item => item.quantity > 0);
      
      if (validItems.length === 0) {
        throw new Error("Savatcha bo'sh!");
      }

      const payload = {
        customerName: customerName || undefined,
        type: "retail" as const, // yoki "pos"
        paymentMethod,
        exchangeRate: exchangeRate,
        items: validItems.map((item) => ({
          productId: item.product.id,
          quantity: String(item.quantity),
        })),
      };

      return orderService.create(payload);
    },
    onSuccess: () => {
      toast.success("Sotuv amalga oshirildi!");
      // Savatni tozalaymiz
      setCart([]);
      setCustomerName("");
      setPaymentMethod("cash");
      // Mahsulotlar ro'yxatini yangilaymiz (stock kamayganini ko'rish uchun)
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  // --- HANDLERS (LOGIKA) ---

  // 1. Qo'shish
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) {
        // Agar omborda yetarli bo'lsa qo'shamiz
        if (exists.quantity >= Number(product.stock)) {
          toast.warning(`Omborda faqat ${product.stock} ta bor`);
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // 2. Kamaytirish (Minus)
  const decreaseFromCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (!existing) return prev;

      if (existing.quantity <= 1) {
        return prev.filter((i) => i.product.id !== product.id);
      }
      return prev.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  // 3. Butunlay o'chirish (Trash)
  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== id));
  };

  // 4. Input orqali yangilash
  const updateQuantity = (id: number, qty: number) => {
    if (qty < 0) return;
    setCart((prev) =>
      prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i))
    );
  };

  // 5. Stock xatoligini tekshirish
  const getStockError = (item: CartItem): string | null => {
    // POS da limit shunchaki ombordagi bor son (product.stock)
    // Edit dagi kabi "originalQuantity" ni qo'shish shart emas
    const limit = Number(item.product.stock);
    if (item.quantity > limit) {
      return `Omborda faqat ${limit} ta bor`;
    }
    return null;
  };

  // --- SEARCH & CALCULATIONS ---
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p: Product) =>
      p.name.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      String(p.barcode || "").includes(q)
    );
  }, [products, searchQuery]);

  const { totalAmount, totalUSD } = useMemo(() => {
    let usd = 0, uzs = 0;
    cart.forEach((item) => {
      const price = Number(item.product.price);
      const qty = item.quantity;
      if (item.product.currency === "USD") usd += price * qty;
      else uzs += price * qty;
    });
    const rate = parseFloat(exchangeRate) || 1;
    return { totalAmount: uzs + usd * rate, totalUSD: usd };
  }, [cart, exchangeRate]);

  // --- RENDER ---
  if (productsLoading) return <Skeleton className="h-full w-full m-4" />;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-2 pb-24">
      {/* HEADER: Oddiy va tushunarli */}
      <PageHeader
        title="Yangi Savdo"
        description="Mahsulotlarni tanlang va to'lovni qabul qiling"
      >
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            refetch();
            toast.info("Mahsulotlar bazasi yangilandi");
          }}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Yangilash
        </Button>
      </PageHeader>

      {/* BODY: Product List (Biz yaratgan component) */}
      <div className="flex-1 min-h-0">
        <ProductList
          products={filteredProducts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cart={cart}
          onAddToCart={addToCart}
          onDecreaseFromCart={decreaseFromCart}
          onRemoveFromCart={removeFromCart}
        />
      </div>

      {/* FOOTER: Floating Cart (Biz yaratgan component) */}
      <OrderCartFloating
        cart={cart}
        customerName={customerName}
        paymentMethod={paymentMethod}
        exchangeRate={exchangeRate}
        totalAmount={totalAmount}
        totalUSD={totalUSD}
        onCustomerNameChange={setCustomerName}
        onPaymentMethodChange={setPaymentMethod}
        onExchangeRateChange={setExchangeRate}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        getStockError={getStockError}
        onSave={() => createOrderMutation.mutate()}
        isSaving={createOrderMutation.isPending}
      />
    </div>
  );
}