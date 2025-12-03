"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Download, Package, Cuboid, Search } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const importStockSchema = z.object({
  productId: z.string().min(1, "Mahsulot tanlang"),
  quantity: z.coerce.number().min(1, "Miqdor 0 dan katta bo'lishi kerak"),
});

type ImportStockFormValues = z.infer<typeof importStockSchema>;

interface ImportStockDialogProps {
  products: any[];
}

export function ImportStockDialog({ products = [] }: ImportStockDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ImportStockFormValues>({
    resolver: zodResolver(importStockSchema),
    defaultValues: {
      productId: "",
      quantity: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ImportStockFormValues) => 
      productService.importStock(Number(data.productId), data.quantity),
    onSuccess: () => {
      toast.success("Mahsulot kirim qilindi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error?.message || "Xatolik yuz berdi");
    },
  });

  const onSubmit = (data: ImportStockFormValues) => {
    mutation.mutate(data);
  };

  // Qidiruv uchun
  const [searchTerm, setSearchTerm] = useState("");
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.barcode && p.barcode.includes(searchTerm))
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-dashed border-2 border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 h-10 px-6 rounded-xl font-bold shadow-sm">
          <Download className="mr-2 h-5 w-5" /> Kirim qilish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-800/30">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                Kirim qilish
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Mavjud mahsulot sonini ko'paytirish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Mahsulot</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl font-medium">
                          <SelectValue placeholder="Mahsulotni tanlang" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 z-[9999] max-h-[300px]">
                         {/* Search Input inside Select */}
                         <div className="p-2 sticky top-0 bg-white dark:bg-[#1C2C30] z-10 border-b border-gray-100 dark:border-white/5">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Qidirish..." 
                                    className="pl-8 h-9 bg-gray-50 dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-emerald-500" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.stopPropagation()} 
                                />
                            </div>
                         </div>
                         {filteredProducts.map((product: any) => (
                           <SelectItem key={product.id} value={product.id.toString()}>
                             {product.name} <span className="text-muted-foreground text-xs ml-2">({product.stock} {product.unit})</span>
                           </SelectItem>
                         ))}
                         {filteredProducts.length === 0 && (
                             <div className="p-4 text-center text-sm text-muted-foreground">Mahsulot topilmadi</div>
                         )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Qo'shiladigan miqdor</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Cuboid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                type="number" 
                                placeholder="0" 
                                {...field} 
                                className="pl-10 h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all rounded-xl font-medium" 
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-11 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 font-semibold">
                    Bekor qilish
                </Button>
                <Button 
                    type="submit" 
                    disabled={mutation.isPending} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 rounded-xl px-8 font-bold shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
                >
                  {mutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim qilish"}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

