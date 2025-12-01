"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { categoryService } from "@/lib/services/category.service";
import { orderService, CreateOrderPayload, OrderItem } from "@/lib/services/order.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CreditCard,
  Banknote,
  Building2,
  Receipt,
  X,
  Package,
  User,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  barcode?: string;
}

const paymentMethods = [
  { value: "cash", label: "Naqd", icon: Banknote },
  { value: "card", label: "Karta", icon: CreditCard },
  { value: "transfer", label: "O'tkazma", icon: Building2 },
];

export default function POSPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "transfer" | "debt">("cash");

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
      // Mahsulotlar avtomatik yangilanadi Socket.io orqali
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  // Filtrlangan mahsulotlar
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch =
        product.name?.toLowerCase().includes(search.toLowerCase()) ||
        product.barcode?.includes(search);
      const matchesCategory =
        selectedCategory === "all" || product.categoryId === Number(selectedCategory);
      return matchesSearch && matchesCategory && product.isActive && !product.isDeleted;
    });
  }, [products, search, selectedCategory]);

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
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
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
      exchangeRate: "1",
      items,
    };

    createOrderMutation.mutate(payload);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-4">
      {/* Chap tomon - Mahsulotlar */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#132326] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10 space-y-4">
          {/* Qidiruv */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Mahsulot nomi yoki barkod..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 font-medium"
            />
          </div>

          {/* Kategoriyalar */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "shrink-0 font-bold",
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
                  "shrink-0 font-bold",
                  selectedCategory === String(cat.id) && "bg-[#00B8D9] hover:bg-[#00B8D9]/90"
                )}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Mahsulotlar Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Package className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Mahsulot topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredProducts.map((product: any) => {
                const inCart = cart.find((item) => item.productId === product.id);
                const stock = Number(product.stock);
                const isOutOfStock = stock < 1;

                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={cn(
                      "relative p-4 rounded-xl border text-left transition-all group",
                      "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10",
                      "hover:border-[#00B8D9] hover:shadow-md hover:scale-[1.02]",
                      isOutOfStock && "opacity-50 cursor-not-allowed hover:scale-100",
                      inCart && "border-[#00B8D9] bg-[#00B8D9]/5 shadow-sm"
                    )}
                  >
                    {inCart && (
                      <Badge className="absolute -top-2 -right-2 bg-[#00B8D9] font-bold shadow-lg">
                        {inCart.quantity}
                      </Badge>
                    )}
                    <div className="mb-3">
                      <h4 className="font-bold text-sm text-[#212B36] dark:text-white line-clamp-2 mb-1">
                        {product.name}
                      </h4>
                      {product.barcode && (
                        <p className="text-xs text-muted-foreground font-mono">{product.barcode}</p>
                      )}
                    </div>
                    <p className="text-lg font-extrabold text-[#00B8D9] mb-1">
                      {new Intl.NumberFormat("uz-UZ").format(Number(product.price))}
                      <span className="text-xs font-normal text-muted-foreground ml-1">UZS</span>
                    </p>
                    <p className={cn(
                      "text-xs font-medium",
                      stock < 10 ? "text-rose-500" : "text-muted-foreground"
                    )}>
                      Ombor: {stock} dona
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* O'ng tomon - Savatcha */}
      <div className="w-full lg:w-[420px] flex flex-col bg-white dark:bg-[#132326] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#00B8D9]/10 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                <h3 className="font-bold text-[#212B36] dark:text-white">Savatcha</h3>
                <p className="text-xs text-muted-foreground">{cart.length} ta mahsulot</p>
              </div>
            </div>
            {cart.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCart([])}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Tozalash
              </Button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">Savatcha bo'sh</p>
              <p className="text-xs">Mahsulot tanlang</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#212B36] dark:text-white truncate">
                    {item.name}
                  </h4>
                  <p className="text-sm text-[#00B8D9] font-bold">
                    {new Intl.NumberFormat("uz-UZ").format(item.price * item.quantity)} UZS
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.productId, -1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-bold">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.productId, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    onClick={() => removeFromCart(item.productId)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Checkout */}
        <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-4 bg-gray-50 dark:bg-white/5">
          {/* Mijoz nomi */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Mijoz ismi (ixtiyoriy)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="pl-10 h-11 bg-white dark:bg-[#132326] font-medium"
            />
          </div>

          {/* To'lov usuli */}
          <div className="flex gap-2">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Button
                  key={method.value}
                  variant={paymentMethod === method.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={cn(
                    "flex-1 font-bold h-11",
                    paymentMethod === method.value && "bg-[#00B8D9] hover:bg-[#00B8D9]/90"
                  )}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {method.label}
                </Button>
              );
            })}
          </div>

          {/* Jami */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white dark:bg-[#132326] border border-gray-200 dark:border-white/10">
            <span className="text-muted-foreground font-medium">Jami:</span>
            <span className="text-2xl font-extrabold text-[#212B36] dark:text-white">
              {new Intl.NumberFormat("uz-UZ").format(totalAmount)}
              <span className="text-sm font-normal text-muted-foreground ml-1">UZS</span>
            </span>
          </div>

          {/* Buyurtma tugmasi */}
          <Button
            onClick={handleCreateOrder}
            disabled={cart.length === 0 || createOrderMutation.isPending}
            className="w-full h-14 text-lg font-bold bg-[#00B8D9] hover:bg-[#00B8D9]/90 shadow-lg"
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Yuborilmoqda...
              </>
            ) : (
              <>
                <Receipt className="w-5 h-5 mr-2" />
                Buyurtma berish
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
