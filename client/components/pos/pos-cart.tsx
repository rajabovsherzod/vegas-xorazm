"use client";

import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  X,
  User,
  Loader2,
  Receipt,
  CreditCard,
  Banknote,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  barcode?: string;
}

interface PosCartProps {
  cart: CartItem[];
  totalItems: number;
  totalAmount: number;
  customerName: string;
  setCustomerName: (value: string) => void;
  paymentMethod: "cash" | "card" | "transfer" | "debt";
  setPaymentMethod: (value: "cash" | "card" | "transfer" | "debt") => void;
  updateQuantity: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  onCheckout: () => void;
  isPending: boolean;
}

const paymentMethods = [
  { value: "cash", label: "Naqd", icon: Banknote },
  { value: "card", label: "Karta", icon: CreditCard },
  { value: "transfer", label: "O'tkazma", icon: Building2 },
] as const;

export function PosCart({
  cart,
  totalItems,
  totalAmount,
  customerName,
  setCustomerName,
  paymentMethod,
  setPaymentMethod,
  updateQuantity,
  removeFromCart,
  clearCart,
  onCheckout,
  isPending,
}: PosCartProps) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#132326]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#00B8D9]/10 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-[#00B8D9]" />
          </div>
          <div>
            <h3 className="font-bold text-[#212B36] dark:text-white">Savatcha</h3>
            <p className="text-xs text-muted-foreground">{totalItems} ta mahsulot</p>
          </div>
        </div>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Tozalash
          </Button>
        )}
      </div>

      {/* Items */}
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
                  className="h-8 w-8 shrink-0"
                  onClick={() => updateQuantity(item.productId, -1)}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => updateQuantity(item.productId, 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                  onClick={() => removeFromCart(item.productId)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-4 bg-gray-50 dark:bg-white/5 shrink-0 pb-8 md:pb-4">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Mijoz ismi (ixtiyoriy)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="pl-10 h-11 bg-white dark:bg-[#132326] font-medium"
          />
        </div>

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

        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white dark:bg-[#132326] border border-gray-200 dark:border-white/10">
          <span className="text-muted-foreground font-medium">Jami:</span>
          <span className="text-2xl font-extrabold text-[#212B36] dark:text-white">
            {new Intl.NumberFormat("uz-UZ").format(totalAmount)}
            <span className="text-sm font-normal text-muted-foreground ml-1">UZS</span>
          </span>
        </div>

        <Button
          onClick={onCheckout}
          disabled={cart.length === 0 || isPending}
          className="w-full h-14 text-lg font-bold bg-[#00B8D9] hover:bg-[#00B8D9]/90 shadow-lg"
        >
          {isPending ? (
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
  );
}
