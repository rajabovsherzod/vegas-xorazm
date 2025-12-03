"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, Order } from "@/lib/services/order.service";
import { productService } from "@/lib/services/product.service";
import type { Product } from "@/types/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  Save,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  ShoppingCart,
  Package,
  Search,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  product: Product;
  quantity: number;
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const orderId = Number(params.id);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "debt">("cash");
  const [exchangeRate, setExchangeRate] = useState("12800");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadedOrderId, setLoadedOrderId] = useState<number | null>(null);

  // Fetch order data
  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
    enabled: !!orderId && orderId > 0,
    retry: 2,
  });

  // Fetch products
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll({ limit: 1000 }),
    retry: 2,
  });

  // Debug full products response FIRST
  useEffect(() => {
    if (productsResponse) {
      console.log("🔍 FULL Products Response:", productsResponse);
      console.log("🔍 productsResponse.data:", productsResponse.data);
      console.log("🔍 Type of productsResponse:", typeof productsResponse);
      console.log("🔍 Is productsResponse array?", Array.isArray(productsResponse));
    }
  }, [productsResponse]);

  // Parse products correctly from paginated response
  const products = (() => {
    if (!productsResponse) {
      console.log("❌ No productsResponse");
      return [];
    }

    // If productsResponse itself is an array
    if (Array.isArray(productsResponse)) {
      console.log("✅ productsResponse is array, length:", productsResponse.length);
      return productsResponse;
    }

    // NEW FORMAT: { products: [...], pagination: {...} }
    if ((productsResponse as any).products && Array.isArray((productsResponse as any).products)) {
      console.log("✅ Found productsResponse.products array, length:", (productsResponse as any).products.length);
      return (productsResponse as any).products;
    }

    // If productsResponse.data is an array
    if (Array.isArray(productsResponse.data)) {
      console.log("✅ productsResponse.data is array, length:", productsResponse.data.length);
      return productsResponse.data;
    }

    // If productsResponse has nested data
    if (productsResponse.data && typeof productsResponse.data === 'object') {
      const nestedData = (productsResponse.data as any).data;
      if (Array.isArray(nestedData)) {
        console.log("✅ Found nested data array, length:", nestedData.length);
        return nestedData;
      }
    }

    console.log("❌ Could not parse products, returning empty array");
    console.log("❌ productsResponse structure:", Object.keys(productsResponse));
    return [];
  })();

  // Debug parsed products
  useEffect(() => {
    console.log("📦 Parsed Products:", {
      count: products.length,
      firstProduct: products[0]?.name,
      sample: products.slice(0, 3).map((p: Product) => ({ id: p.id, name: p.name }))
    });
  }, [products]);

  // Debug logs
  useEffect(() => {
    console.log("🔍 Edit Page Debug:", {
      orderId,
      orderLoading,
      productsLoading,
      orderExists: !!order,
      orderStatus: order?.status,
      orderItemsCount: order?.items?.length,
      productsCount: products.length,
      cartCount: cart.length,
      loadedOrderId,
    });

    // Debug order items
    if (order?.items) {
      console.log("📝 Order Items:", order.items);
    }
  }, [orderId, orderLoading, productsLoading, order, products, cart, loadedOrderId]);

  // Load order data into form
  useEffect(() => {
    // Wait for both order and products to load
    if (!order || products.length === 0 || !order.items) {
      console.log("⏳ Waiting for data...", {
        hasOrder: !!order,
        productsCount: products.length,
        hasItems: !!order?.items,
        itemsCount: order?.items?.length,
      });
      return;
    }

    // ALWAYS reload data when order or products change (fix cache issue)
    // Reset data loaded flag when order changes
    console.log("🔄 Loading/Reloading order data...", {
      orderId: order.id,
      currentCartSize: cart.length,
      loadedOrderId,
    });

    // Don't reload if this order is already loaded
    if (loadedOrderId === order.id) {
      console.log("✅ Order already loaded, skipping...");
      return;
    }

    console.log("📦 Loading order data...", {
      orderId: order.id,
      status: order.status,
      itemsCount: order.items.length,
      productsCount: products.length,
    });

    // Check if order is draft
    if (order.status !== "draft") {
      toast.error("Faqat kutilayotgan buyurtmalarni tahrir qilish mumkin");
      router.push("/cashier/orders");
      return;
    }

    // Load cart items
    const loadedCart: CartItem[] = order.items
      .map((item: any) => {
        console.log("🔍 Looking for product:", item.productId, "in", products.length, "products");
        const product = products.find((p: Product) => p.id === item.productId);
        if (!product) {
          console.warn("⚠️ Product not found:", item.productId);
          return null;
        }
        console.log("✅ Product found:", product.name);
        return {
          product,
          quantity: Number(item.quantity),
        };
      })
      .filter((item): item is CartItem => item !== null);

    console.log("✅ Cart loaded with", loadedCart.length, "items:", loadedCart);

    setCart(loadedCart);
    setCustomerName(order.customerName || "");
    setPaymentMethod(order.paymentMethod);
    setExchangeRate(order.exchangeRate);
    setLoadedOrderId(order.id);

    // Calculate total quantity
    const totalQty = loadedCart.reduce((sum, item) => sum + item.quantity, 0);
    toast.success(`${loadedCart.length} xil mahsulot yuklandi (Jami: ${totalQty} ta)`);
  }, [order, products, router, loadedOrderId, cart.length]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: () => {
      // Filter out items with 0 or negative quantity
      const validItems = cart.filter(item => item.quantity > 0);

      const payload = {
        items: validItems.map((item) => ({
          productId: item.product.id,
          quantity: String(item.quantity),
        })),
        customerName: customerName || undefined,
        paymentMethod,
        exchangeRate,
        type: order?.type || "retail",
      };

      console.log("📤 Updating order:", payload);
      return orderService.update(orderId, payload);
    },
    onSuccess: () => {
      toast.success("Buyurtma muvaffaqiyatli tahrir qilindi!");
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Reset loaded flag so next time it loads fresh data
      setLoadedOrderId(null);
      router.push("/cashier/orders");
    },
    onError: (error: any) => {
      console.error("❌ Update error:", error);
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  // Cart functions
  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
      toast.success(`${product.name} miqdori oshirildi`);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
      toast.success(`${product.name} savatga qo'shildi`);
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    // Allow 0, but don't auto-remove (user might be typing)
    // Validation will happen on save
    if (quantity < 0) {
      return; // Don't allow negative
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    const product = cart.find(item => item.product.id === productId);
    setCart(cart.filter((item) => item.product.id !== productId));
    if (product) {
      toast.info(`${product.product.name} savatdan olib tashlandi`);
    }
  };

  // Calculate totals
  const { totalAmount, totalUSD } = useMemo(() => {
    let usd = 0;
    let uzs = 0;

    cart.forEach((item) => {
      const price = Number(item.product.price);
      const qty = item.quantity;

      if (item.product.currency === "USD") {
        usd += price * qty;
      } else {
        uzs += price * qty;
      }
    });

    const rate = parseFloat(exchangeRate || "1");
    const totalAmount = uzs + usd * rate;

    return { totalAmount, totalUSD: usd };
  }, [cart, exchangeRate]);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p: Product) =>
        p.name.toLowerCase().includes(query) ||
        p.category?.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleSave = () => {
    // Filter out items with 0 quantity
    const validItems = cart.filter(item => item.quantity > 0);

    if (validItems.length === 0) {
      toast.error("Kamida bitta mahsulot tanlang (miqdor 0 dan katta bo'lishi kerak)");
      return;
    }

    // Update cart to only include valid items before saving
    if (validItems.length !== cart.length) {
      const removedCount = cart.length - validItems.length;
      setCart(validItems);
      toast.info(`${removedCount} ta mahsulot (miqdor 0) olib tashlandi`);
    }

    updateMutation.mutate();
  };

  // Loading state
  if (orderLoading || productsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Yuklanmoqda..."
          description="Buyurtma ma'lumotlari yuklanmoqda"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-60 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (orderError || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4">
          <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-[#212B36] dark:text-white">
          Buyurtma topilmadi
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          Buyurtma #{orderId} topilmadi yoki o'chirilgan bo'lishi mumkin
        </p>
        <Button onClick={() => router.push("/cashier/orders")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga qaytish
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Buyurtma #${orderId} ni tahrir qilish`}
        description={`Status: ${order.status === 'draft' ? 'Kutilayotgan' : order.status} • ${cart.length} ta mahsulot`}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/cashier/orders")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Bekor qilish
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || cart.length === 0}
            className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Saqlash
              </>
            )}
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Product List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-200 dark:border-white/10 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#212B36] dark:text-white">
                  <Package className="w-5 h-5 text-[#00B8D9]" />
                  Mahsulotlar
                  <Badge variant="outline" className="ml-2">
                    {filteredProducts.length}
                  </Badge>
                </CardTitle>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Mahsulot qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Mahsulot topilmadi" : "Mahsulotlar yuklanmoqda..."}
                  </p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto space-y-2 pr-2">
                  {filteredProducts.map((product: Product) => {
                    const inCart = cart.some(item => item.product.id === product.id);
                    return (
                      <div
                        key={product.id}
                        className={`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${inCart
                          ? "border-[#00B8D9] bg-[#00B8D9]/5 dark:bg-[#00B8D9]/10"
                          : "border-gray-200 dark:border-white/10 hover:border-[#00B8D9]/50 hover:bg-gray-50 dark:hover:bg-white/5"
                          }`}
                        onClick={() => addToCart(product)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#212B36] dark:text-white">
                              {product.name}
                            </p>
                            {inCart && (
                              <Badge className="bg-[#00B8D9] text-white text-xs">
                                Savatda
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {product.category?.name || "Kategoriyasiz"}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Ombor: {product.stock} {product.unit}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-[#212B36] dark:text-white">
                            {formatCurrency(Number(product.price), product.currency)}
                          </p>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {product.currency}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Cart & Info */}
        <div className="space-y-4">
          <Card className="border-gray-200 dark:border-white/10 shadow-sm">
            <CardHeader className="border-b border-gray-200 dark:border-white/10">
              <CardTitle className="flex items-center gap-2 text-[#212B36] dark:text-white">
                <ShoppingCart className="w-5 h-5 text-[#00B8D9]" />
                Savat
                <Badge className="ml-auto bg-[#00B8D9] text-white">
                  {cart.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Mijoz ismi</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Mijoz ismi (ixtiyoriy)"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">To'lov turi</Label>
                  <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Naqd</SelectItem>
                      <SelectItem value="card">💳 Karta</SelectItem>
                      <SelectItem value="transfer">🏦 O'tkazma</SelectItem>
                      <SelectItem value="debt">📝 Nasiya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Kurs (USD → UZS)</Label>
                  <Input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                <h4 className="text-sm font-semibold mb-3 text-[#212B36] dark:text-white">
                  Mahsulotlar
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl">
                      <ShoppingCart className="w-10 h-10 text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Savat bo'sh
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Mahsulot qo'shish uchun chapdan tanlang
                      </p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex items-center gap-2 p-3 border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#1C2C30]"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-[#212B36] dark:text-white">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(Number(item.product.price), item.product.currency)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-gray-200 dark:border-white/10"
                            onClick={() => {
                              const newQty = Math.max(0, item.quantity - 1);
                              updateQuantity(item.product.id, newQty);
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => {
                              const val = e.target.value.trim();

                              // Allow empty string (user cleared input)
                              if (val === '') {
                                updateQuantity(item.product.id, 0);
                                return;
                              }

                              // Only allow digits
                              if (!/^\d+$/.test(val)) {
                                return;
                              }

                              const numVal = parseInt(val, 10);
                              if (!isNaN(numVal) && numVal >= 0) {
                                updateQuantity(item.product.id, numVal);
                              }
                            }}
                            onBlur={(e) => {
                              // If empty on blur, set to 0
                              if (e.target.value.trim() === '') {
                                updateQuantity(item.product.id, 0);
                              }
                            }}
                            className="w-16 h-8 text-center px-1"
                            placeholder="0"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 border-gray-200 dark:border-white/10"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            onClick={() => removeFromCart(item.product.id)}
                            title="Savatdan olib tashlash"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Total */}
              {cart.length > 0 && (
                <div className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-2">
                  {totalUSD > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">USD qismi:</span>
                      <span className="font-semibold">${totalUSD.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-white/10">
                    <span className="text-lg font-bold text-[#212B36] dark:text-white">Jami:</span>
                    <span className="text-2xl font-bold text-[#00B8D9]">
                      {formatCurrency(totalAmount, "UZS")}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
