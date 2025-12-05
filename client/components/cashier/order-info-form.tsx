"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CreditCard, Wallet, ArrowLeftRight, Receipt, Percent, X, CircleDollarSign } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface OrderInfoFormProps {
  customerName: string;
  paymentMethod: "cash" | "card" | "transfer" | "debt";
  exchangeRate: string;
  onCustomerNameChange: (value: string) => void;
  onPaymentMethodChange: (value: "cash" | "card" | "transfer" | "debt") => void;
  onExchangeRateChange: (value: string) => void;
  
  // Discount props
  discountAmount?: number; // Hisoblangan summa (so'mda)
  discountValue?: number;  // Kiritilgan raqam
  discountType?: 'percent' | 'fixed';
  onDiscountApply?: (amount: number, value: number, type: 'percent' | 'fixed') => void;
  
  subTotal: number; 
  canDiscount?: boolean;
}

const paymentMethods = {
  cash: { label: "Naqd", icon: Wallet },
  card: { label: "Karta", icon: CreditCard },
  transfer: { label: "O'tkazma", icon: ArrowLeftRight },
  debt: { label: "Nasiya", icon: Receipt },
};

export function OrderInfoForm({
  customerName,
  paymentMethod,
  exchangeRate,
  onCustomerNameChange,
  onPaymentMethodChange,
  onExchangeRateChange,
  discountAmount = 0,
  discountValue = 0,
  discountType = 'fixed',
  onDiscountApply,
  subTotal = 0,
  canDiscount = false,
}: OrderInfoFormProps) {
  const PaymentIcon = paymentMethods[paymentMethod].icon;
  
  const [showDiscount, setShowDiscount] = useState(discountAmount > 0);
  const [mode, setMode] = useState<'percent' | 'fixed'>('fixed');
  const [inputValue, setInputValue] = useState("");

  // 1. INIT & SYNC: Edit paytida yoki tashqaridan o'zgarganda state ni yangilash
  useEffect(() => {
    if (discountAmount > 0) {
      setShowDiscount(true);
      // Agar backenddan type kelsa, o'shani qo'yamiz, bo'lmasa fixed
      setMode(discountType || 'fixed');
      
      // Input qiymatini to'g'ri ko'rsatish
      // Agar discountValue backenddan kelsa, o'shani qo'yamiz. 
      // Agar yo'q bo'lsa (eski ma'lumot), discountAmountni qo'yamiz.
      const valToShow = discountValue > 0 ? discountValue : discountAmount;
      setInputValue(valToShow.toString());
    }
  }, [discountAmount, discountType, discountValue]);

  // 2. INPUT HANDLER: Yozganda hisoblash
  const handleInputChange = (val: string) => {
    setInputValue(val);
    const numVal = parseFloat(val);

    if (isNaN(numVal) || numVal < 0) {
      // Agar noto'g'ri raqam bo'lsa, chegirmani 0 qilamiz, lekin inputni tozalab yubormaymiz (user yozayotgan bo'lishi mumkin)
      onDiscountApply?.(0, 0, mode);
      return;
    }

    if (mode === 'fixed') {
      // Fixed: Kiritilgan raqam = Chegirma summasi
      // Validatsiya: Chegirma jami summadan oshib ketmasligi kerak
      const validAmount = numVal > subTotal ? subTotal : numVal;
      onDiscountApply?.(validAmount, validAmount, 'fixed');
    } else {
      // Percent: Jami * (Foiz / 100) = Chegirma summasi
      // Validatsiya: 100% dan oshmasligi kerak
      const validPercent = numVal > 100 ? 100 : numVal;
      const calculatedAmount = subTotal * (validPercent / 100);
      onDiscountApply?.(calculatedAmount, validPercent, 'percent');
    }
  };

  // 3. 🔥 LOGIKA: TAB ALMASHGANDA KONVERTATSIYA QILISH
  const toggleMode = (newMode: 'percent' | 'fixed') => {
    if (newMode === mode) return; // O'zgarmasa hech narsa qilmaymiz

    setMode(newMode);
    
    // Agar hozirgi qiymat bo'lsa, uni konvertatsiya qilamiz
    if (discountAmount > 0 && subTotal > 0) {
        let newValue = 0;

        if (newMode === 'percent') {
            // So'mdan -> Foizga o'tish
            // Formula: (Summa / Jami) * 100
            const percent = (discountAmount / subTotal) * 100;
            // Chiroyli ko'rinishi uchun 2 xona qoldiramiz (masalan 10.55%)
            newValue = parseFloat(percent.toFixed(2));
        } else {
            // Foizdan -> So'mga o'tish
            // Formula: Summa (Zatan discountAmount da tayyor turibdi)
            newValue = Math.round(discountAmount); // So'm butun bo'lgani yaxshi
        }

        setInputValue(newValue.toString());
        // Parentga yangilangan turni yuboramiz
        onDiscountApply?.(discountAmount, newValue, newMode);
    } else {
        // Agar summa 0 bo'lsa, inputni tozalaymiz
        setInputValue("");
        onDiscountApply?.(0, 0, newMode);
    }
  };

  return (
    <div className="space-y-4">
      {/* ... Customer & Payment (O'zgarishsiz) ... */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Mijoz ismi</Label>
        <Input value={customerName} onChange={(e) => onCustomerNameChange(e.target.value)} placeholder="Mijoz ismi" className="h-11 rounded-xl bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 focus:border-[#00B8D9] focus:ring-2 focus:ring-[#00B8D9]/20" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">To'lov usuli</Label>
            <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                <SelectTrigger className="h-11 bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 focus:border-[#00B8D9] focus:ring-2 focus:ring-[#00B8D9]/20 rounded-xl">
                <div className="flex items-center gap-2"><PaymentIcon className="w-4 h-4 text-[#00B8D9]" /><SelectValue /></div>
                </SelectTrigger>
                <SelectContent>{Object.entries(paymentMethods).map(([key, { label, icon: Icon }]) => (<SelectItem key={key} value={key}><div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span>{label}</span></div></SelectItem>))}</SelectContent>
            </Select>
        </div>
        <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">USD kursi</Label>
            <Input type="number" value={exchangeRate} onChange={(e) => onExchangeRateChange(e.target.value)} className="h-11 bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 focus:border-[#00B8D9] focus:ring-2 focus:ring-[#00B8D9]/20 rounded-xl font-mono" />
        </div>
      </div>

      {/* CHEGIRMA QISMI */}
      {canDiscount && (
        <div className="pt-3 border-t border-dashed border-gray-200 dark:border-white/10">
          {!showDiscount ? (
            <Button
              variant="ghost"
              onClick={() => setShowDiscount(true)}
              className="w-full text-[#00B8D9] hover:text-[#00a0bc] hover:bg-[#00B8D9]/10 h-11 font-bold rounded-xl border border-dashed border-[#00B8D9]/30 transition-all active:scale-95"
            >
              <Percent className="w-4 h-4 mr-2" />
              Umumiy chegirma qo'shish
            </Button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 bg-[#00B8D9]/5 p-3 rounded-xl border border-[#00B8D9]/20">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-[#00B8D9] uppercase tracking-wide">Chegirma</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-gray-400 hover:text-rose-500 hover:bg-transparent rounded-full"
                  onClick={() => {
                    setShowDiscount(false);
                    setInputValue("");
                    onDiscountApply?.(0, 0, 'fixed'); // Reset
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Toggle Buttons */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-white dark:bg-black/20 rounded-lg border border-gray-100 dark:border-white/5">
                <button onClick={() => toggleMode('fixed')} className={cn("flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-md transition-all", mode === 'fixed' ? "bg-[#00B8D9] text-white shadow-sm" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5")}><span className="text-[10px]">UZS</span> So'mda</button>
                <button onClick={() => toggleMode('percent')} className={cn("flex items-center justify-center gap-1.5 text-xs font-bold py-1.5 rounded-md transition-all", mode === 'percent' ? "bg-[#00B8D9] text-white shadow-sm" : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/5")}><Percent className="w-3 h-3" /> Foizda</button>
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-white dark:bg-white/10 rounded text-[#00B8D9]">
                   {mode === 'percent' ? <Percent className="w-3.5 h-3.5" /> : <CircleDollarSign className="w-3.5 h-3.5" />}
                </div>
                <Input
                  type="number"
                  placeholder="0"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="pl-12 h-11 bg-white dark:bg-[#132326] border-transparent shadow-sm focus:border-[#00B8D9] focus:ring-2 focus:ring-[#00B8D9]/20 rounded-xl font-bold text-lg text-gray-900 dark:text-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {mode === 'percent' && inputValue && (
                <div className="text-right text-xs font-medium text-muted-foreground px-1">
                  = {formatCurrency(discountAmount || 0, "UZS")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}