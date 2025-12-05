"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { Product } from "@/types/api";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Loader2, Plus, Package, Cuboid, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
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

  // --- MUTATION ---
  const addStockMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProduct) throw new Error("Mahsulot tanlanmagan");
      
      // Validatsiya: Miqdor bo'lishi shart
      const qty = Number(quantity);
      if (isNaN(qty) || qty <= 0) throw new Error("Miqdor noto'g'ri kiritildi");

      // Narx ixtiyoriy
      const price = newPrice ? Number(newPrice) : undefined;

      return productService.addStock(selectedProduct.id, qty, price);
    },
    onSuccess: () => {
      toast.success(`${selectedProduct?.name} zaxirasi to'ldirildi!`);
      
      // Keshni yangilash
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Agar tarix bo'lsa uni ham yangilash
      queryClient.invalidateQueries({ queryKey: ["stock-history"] });
      
      setOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      // Backenddan kelgan aniq xatoni ko'rsatish
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
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" />
          Kirim Qilish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-500/10">
                <Cuboid className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                Kirim Qilish
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Mavjud mahsulot zaxirasini to'ldirish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* PRODUCT SELECT */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">Mahsulotni tanlang</Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverOpen}
                    className="w-full justify-between h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl font-medium text-[#212B36] dark:text-white"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Package className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">
                        {selectedProduct ? selectedProduct.name : "Mahsulotni qidiring..."}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-white dark:bg-[#132326] border-gray-200 dark:border-white/10 shadow-xl rounded-xl" side="bottom" avoidCollisions={false}>
                  <Command className="bg-transparent">
                    <CommandInput placeholder="Mahsulot nomi yoki shtrix-kod..." className="h-11" />
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">Mahsulot topilmadi.</CommandEmpty>
                      <CommandGroup>
                        {products?.filter(Boolean).map((product) => (
                          <CommandItem
                            key={product.id}
                            value={`${product.name} ${product.barcode}`}
                            onSelect={() => {
                              setSelectedProduct(product);
                              // Agar yangi narx kiritilmagan bo'lsa, eskisini taklif qilishimiz mumkin (lekin majburiy emas)
                              setPopoverOpen(false);
                            }}
                            className="cursor-pointer py-3 px-4 aria-selected:bg-emerald-50 dark:aria-selected:bg-emerald-900/20 aria-selected:text-emerald-900 dark:aria-selected:text-emerald-100"
                          >
                            <Check
                              className={cn(
                                "mr-3 h-4 w-4 text-emerald-600",
                                selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                              <span className="font-semibold text-sm truncate">{product.name}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-2">
                                <span className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">{product.barcode || "---"}</span>
                                <span>|</span>
                                <span>Qoldiq: {product.stock} {product.unit}</span>
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* INPUTS */}
            {selectedProduct && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700 dark:text-gray-200">Miqdor (+)</Label>
                  <div className="relative">
                    <Cuboid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      className="pl-10 h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-xl font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPrice" className="text-sm font-medium text-gray-700 dark:text-gray-200">Yangi narx (ixtiyoriy)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="newPrice"
                      type="number"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder={String(selectedProduct.price)}
                      min="0"
                      step="any"
                      className="pl-10 h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-xl font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FOOTER BUTTONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-11 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 font-semibold">
                Bekor qilish
              </Button>
              <Button
                type="submit"
                disabled={addStockMutation.isPending || !selectedProduct || !quantity}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl px-8 font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
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