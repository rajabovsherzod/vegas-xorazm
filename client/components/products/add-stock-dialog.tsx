"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { Product } from "@/types/api";
import { toast } from "sonner";
import { 
  Check, 
  ChevronsUpDown, 
  Loader2, 
  Plus, 
  Package, 
  Cuboid, 
  DollarSign, 
  Search,
  Barcode
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddStockDialogProps {
  products: Product[];
}

export function AddStockDialog({ products }: AddStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const queryClient = useQueryClient();

  const addStockMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error("Mahsulot tanlanmagan");
      const qty = Number(quantity);
      if (isNaN(qty) || qty <= 0) throw new Error("Miqdor noto'g'ri kiritildi");
      const price = newPrice ? Number(newPrice) : undefined;
      return productService.addStock(selectedProduct.id, qty, price);
    },
    onSuccess: () => {
      toast.success(`${selectedProduct?.name} zaxirasi to'ldirildi!`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-history"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Xatolik yuz berdi";
      toast.error(msg);
    },
  });

  const resetForm = () => {
    setSelectedProduct(null);
    setQuantity("");
    setNewPrice("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStockMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" />
          Kirim Qilish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1C2C30] border-gray-200 dark:border-white/10 p-0 overflow-hidden rounded-2xl shadow-2xl gap-0">
        
        {/* HEADER */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
                <Cuboid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Kirim Qilish
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Omborga yangi mahsulot qo'shish yoki narxni yangilash
            </p>
          </DialogHeader>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. PRODUCT SELECTION */}
            {/* 1. PRODUCT SELECTION */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                              Mahsulotni tanlang
                            </Label>
                            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={popoverOpen}
                                  className="w-full justify-between h-12 px-4 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-foreground rounded-xl text-base font-normal shadow-sm"
                                >
                                  {selectedProduct ? (
                                    <div className="flex items-center gap-2 truncate text-gray-900 dark:text-white font-medium">
                                      <Package className="w-4 h-4 text-emerald-600" />
                                      {selectedProduct.name}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Qidirish...</span>
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              
                              <PopoverContent 
                                className="w-[450px] p-0 bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 shadow-xl rounded-xl overflow-hidden" 
                                align="start"
                                // 🔥 MUHIM: Scroll bloklanmasligi uchun
                                onOpenAutoFocus={(e) => e.preventDefault()}
                              >
                                <Command className="bg-transparent w-full">
                                  <div className="flex items-center border-b border-gray-100 dark:border-white/5 px-3">
                                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                    <CommandInput 
                                      placeholder="Nomi yoki shtrix-kodi orqali qidiring..." 
                                      className="h-11 text-sm bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 w-full"
                                    />
                                  </div>
                                  
                                  {/* 🔥 FIX: SCROLL MUAMMOSI SHU YERDA HAL QILINDI */}
                                  {/* max-h-[300px]: Balandlik chegarasi */}
                                  {/* overflow-y-auto: Scroll paydo bo'lishi */}
                                  {/* overscroll-contain: Scroll faqat shu yerda ishlashi uchun */}
                                  <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden p-1 overscroll-contain">
                                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                                      Mahsulot topilmadi
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {products?.filter(Boolean).map((product) => (
                                        <CommandItem
                                          key={product.id}
                                          value={`${product.name} ${product.barcode}`}
                                          onSelect={() => {
                                            setSelectedProduct(product);
                                            setPopoverOpen(false);
                                          }}
                                          className="cursor-pointer py-2.5 px-3 mb-1 rounded-lg aria-selected:bg-emerald-50 dark:aria-selected:bg-emerald-900/20 aria-selected:text-emerald-900 dark:aria-selected:text-emerald-50 transition-colors"
                                        >
                                          <div className="flex flex-col flex-1 gap-1 min-w-0">
                                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                              {product.name}
                                            </span>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                              <span className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono text-gray-600 dark:text-gray-300">
                                                <Barcode className="w-3 h-3" />
                                                {product.barcode || "---"}
                                              </span>
                                              <span className="truncate">
                                                Qoldiq: <span className="font-medium text-gray-700 dark:text-gray-300">{product.stock} {product.unit}</span>
                                              </span>
                                            </div>
                                          </div>
                                          {selectedProduct?.id === product.id && (
                                            <Check className="h-4 w-4 text-emerald-600 ml-2 shrink-0" />
                                          )}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

            {/* 2. INPUTS (Animatsiyasiz, oddiy ko'rinishda) */}
            {selectedProduct && (
              <div className="grid grid-cols-2 gap-5 pt-2">
                
                {/* QUANTITY */}
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Qo'shiladigan Miqdor <span className="text-emerald-600 ml-1">({selectedProduct.unit})</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-white/10 rounded-md text-gray-500 group-focus-within:text-emerald-600 group-focus-within:bg-emerald-50 transition-colors">
                       <Plus className="w-4 h-4" />
                    </div>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="0"
                      required
                      min="0.01"
                      step="any"
                      autoFocus
                      className="pl-12 h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl font-semibold text-lg"
                    />
                  </div>
                </div>

                {/* PRICE */}
                <div className="space-y-2">
                  <Label htmlFor="newPrice" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Yangi Narx <span className="text-muted-foreground font-normal">(ixtiyoriy)</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-white/10 rounded-md text-gray-500 group-focus-within:text-emerald-600 group-focus-within:bg-emerald-50 transition-colors">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <Input
                      id="newPrice"
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder={String(selectedProduct.price)}
                      min="0"
                      step="any"
                      className="pl-12 h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5 mt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)} 
                className="h-11 px-6 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 font-medium"
              >
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={addStockMutation.isPending || !selectedProduct || !quantity}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl px-8 font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {addStockMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saqlanmoqda...
                  </>
                ) : (
                  "Saqlash"
                )}
              </Button>
            </div>
            
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}