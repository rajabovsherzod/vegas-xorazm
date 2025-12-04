"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Wallet, ArrowLeftRight, Receipt } from "lucide-react";

interface OrderInfoFormProps {
  customerName: string;
  paymentMethod: "cash" | "card" | "transfer" | "debt";
  exchangeRate: string;
  onCustomerNameChange: (value: string) => void;
  onPaymentMethodChange: (value: "cash" | "card" | "transfer" | "debt") => void;
  onExchangeRateChange: (value: string) => void;
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
}: OrderInfoFormProps) {
  const PaymentIcon = paymentMethods[paymentMethod].icon;

  return (
    <div className="space-y-4">
      {/* Customer Name */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          Mijoz ismi
        </Label>
        <Input
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          placeholder="Mijoz ismini kiriting (ixtiyoriy)"
          className="h-9 bg-white dark:bg-[#132326] border-gray-300 dark:border-white/20 focus:border-[#00B8D9] focus:ring-1 focus:ring-[#00B8D9]"
        />
      </div>

      {/* Payment Method & Exchange Rate */}
      <div className="grid grid-cols-2 gap-3">
        {/* Payment Method */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            To'lov usuli
          </Label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger className="h-9 bg-white dark:bg-[#132326] border-gray-300 dark:border-white/20 focus:border-[#00B8D9] focus:ring-1 focus:ring-[#00B8D9]">
              <div className="flex items-center gap-2">
                <PaymentIcon className="w-4 h-4 text-[#00B8D9]" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span>Naqd</span>
                </div>
              </SelectItem>
              <SelectItem value="card">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Karta</span>
                </div>
              </SelectItem>
              <SelectItem value="transfer">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>O'tkazma</span>
                </div>
              </SelectItem>
              <SelectItem value="debt">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  <span>Nasiya</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Exchange Rate */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            USD kursi
          </Label>
          <Input
            type="number"
            value={exchangeRate}
            onChange={(e) => onExchangeRateChange(e.target.value)}
            placeholder="12800"
            className="h-9 bg-white dark:bg-[#132326] border-gray-300 dark:border-white/20 focus:border-[#00B8D9] focus:ring-1 focus:ring-[#00B8D9]"
          />
        </div>
      </div>
    </div>
  );
}