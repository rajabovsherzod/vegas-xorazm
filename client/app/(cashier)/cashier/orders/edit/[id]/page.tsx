"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle } from "lucide-react";

// Services & Types
import { orderService } from "@/lib/services/order.service";
import { productService } from "@/lib/services/product.service";
import type { Product } from "@/types/api";

// UI Components
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Biz yaratgan professional komponentlar
import { ProductList } from "@/components/cashier/product-list";
import { OrderCartFloating, CartItem } from "@/components/cashier/order-cart";

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const orderId = Number(params.id);

  // --- STATES ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "debt">("cash");
  const [exchangeRate, setExchangeRate] = useState("12800");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedOrderId, setLoadedOrderId] = useState<number | null>(null);
  
  // 🔥 CHEGIRMA STATELARI (Beton v2)
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'percent'|'fixed'>('fixed');

  // --- QUERIES ---
  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId && orderId > 0,
    refetchOnMount: true, 
  });

  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll({ limit: 1000 }),
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

  // --- EFFECT: DATA SYNC ---
  useEffect(() => {
    if (!order || products.length === 0 || !order.items) return;
    if (loadedOrderId === order.id) return;
    
    if (order.status !== "draft") {
      toast.error("Faqat kutilayotgan buyurtmalarni tahrir qilish mumkin");
      router.push("/cashier/orders");
      return;
    }

    const method = ["cash", "card", "transfer", "debt"].includes(order.paymentMethod) 
      ? (order.paymentMethod as any) 
      : "cash";

    const loadedCart: CartItem[] = (order.items || [])
      .map((item: any) => {
        const originalProduct = products.find((p: Product) => p.id === item.productId);
        if (!originalProduct) return null;
        
        const qty = Number(item.quantity);
        const itemPrice = Number(item.price); 
        const catalogPrice = Number(originalProduct.price);

        let productForCart = { ...originalProduct };
        
        // Agar orderdagi narx katalogdagidan farq qilsa (manual discount)
        // Yoki avvalgi aksiya narxi saqlanib qolgan bo'lsa
        if (itemPrice !== catalogPrice) {
            productForCart.discountPrice = String(itemPrice);
        }

        return { 
          product: productForCart, 
          quantity: qty,
          originalQuantity: qty 
        };
      })
      .filter((item: CartItem | null): item is CartItem => item !== null) as CartItem[];

    setCart(loadedCart);
    setCustomerName(order.customerName || "");
    setPaymentMethod(method);
    setExchangeRate(String(order.exchangeRate || "12800"));
    
    // 🔥 CHEGIRMANI TIKLASH (RESTORE)
    setDiscountAmount(Number(order.discountAmount || 0));
    setDiscountValue(Number(order.discountValue || 0));
    setDiscountType((order.discountType as any) || 'fixed');
    
    setLoadedOrderId(order.id);
  }, [order, products, router, loadedOrderId]);

  // --- HANDLERS ---
  
  // 🔥 3 ta qiymatni qabul qiladigan handler
  const handleDiscountApply = (amount: number, value: number, type: 'percent' | 'fixed') => {
    setDiscountAmount(amount);
    setDiscountValue(value);
    setDiscountType(type);
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      const validItems = cart.filter(item => item.quantity > 0);
      if (validItems.length === 0) throw new Error("Kamida bitta mahsulot tanlang");
  
      const payload = {
        items: validItems.map((item) => {
          const sellingPrice = Number(item.product.discountPrice) > 0 
                ? Number(item.product.discountPrice) 
                : undefined;

          return {
            productId: item.product.id,
            quantity: String(item.quantity),
            price: sellingPrice
          };
        }),
        customerName: customerName || undefined,
        paymentMethod: paymentMethod,
        exchangeRate: exchangeRate,
        
        // 🔥 HAMMA CHEGIRMA MA'LUMOTLARI YUBORILADI
        discountAmount: discountAmount,
        discountValue: discountValue,
        discountType: discountType,
        
        type: order?.type || "retail",
      };
      return orderService.update(orderId, payload);
    },
    onSuccess: async () => {
      toast.success("Muvaffaqiyatli saqlandi!");
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.removeQueries({ queryKey: ["order", orderId] });
      setLoadedOrderId(null);
      router.push("/cashier/orders");
    },
    onError: (error: any) => toast.error(error?.message || "Xatolik"),
  });

  // Cart Handlers...
  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(i => i.product.id === product.id);
      if(exists) {
        return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity + 1} : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };
  const decreaseFromCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((i) => i.product.id !== product.id);
      return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity - 1} : i);
    });
  };
  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };
  const updateQuantity = (id: number, qty: number) => {
    if (qty < 0) return;
    setCart(prev => prev.map(i => i.product.id === id ? {...i, quantity: qty} : i));
  };
  const handleUpdatePrice = (id: number, newPrice: number) => {
    setCart((prev) => prev.map((item) => {
        if (item.product.id === id) {
            return {
                ...item,
                product: { ...item.product, discountPrice: String(newPrice) }
            };
        }
        return item;
    }));
  };
  const getStockError = (item: CartItem): string | null => {
     const limit = Number(item.product.stock) + (item.originalQuantity || 0);
     if(item.quantity > limit) return `Omborda faqat ${limit} ta bor`;
     return null;
  };

  // Calculations
  const { totalAmount, totalUSD } = useMemo(() => {
    let usd = 0, uzs = 0;
    cart.forEach((item) => {
      const discountP = parseFloat(item.product.discountPrice || "0");
      const regularP = parseFloat(item.product.price || "0");
      const finalPrice = (discountP > 0) ? discountP : regularP;
      const qty = item.quantity;
      if (item.product.currency === "USD") usd += finalPrice * qty;
      else uzs += finalPrice * qty;
    });
    const rate = parseFloat(exchangeRate) || 1;
    return { totalAmount: uzs + usd * rate, totalUSD: usd };
  }, [cart, exchangeRate]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p: Product) => 
      p.name.toLowerCase().includes(q) || 
      p.category?.name?.toLowerCase().includes(q) ||
      String(p.barcode || "").includes(q)
    );
  }, [products, searchQuery]);

  if (orderLoading || productsLoading) return <div className="p-6"><Skeleton className="h-[600px] w-full" /></div>;
  
  if (orderError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-16 h-16 text-rose-500" />
        <h2 className="text-2xl font-bold">Buyurtma topilmadi</h2>
        <Button onClick={() => router.push("/cashier/orders")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Orqaga
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col gap-2 pb-24"> 
      <PageHeader
        title={`Buyurtma #${orderId} ni tahrir qilish`}
        description={`${cart.length} xil mahsulot savatda`}
      >
        <Button variant="outline" size="sm" onClick={() => router.push("/cashier/orders")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Bekor qilish
        </Button>
      </PageHeader>

      <div className="flex-1 min-h-0 px-4">
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
        
        // 🔥 MUHIM: 100% TUZATILDI
        onUpdatePrice={handleUpdatePrice} 
        
        discountAmount={discountAmount}
        discountValue={discountValue}
        discountType={discountType}
        
        // State handlerini bog'laymiz
        onDiscountApply={handleDiscountApply} 

        canDiscount={true} // ✅ Cashier uchun ruxsat beramiz

        getStockError={getStockError}
        onSave={() => updateMutation.mutate()}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
}