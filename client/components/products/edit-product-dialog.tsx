"use client";

import { useEffect } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, Barcode, Cuboid, Layers, Loader2, DollarSign } from "lucide-react";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services/product.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// SCHEMA: Frontend uchun (Backend validation bilan bir xil mantiqda)
const editProductSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  barcode: z.string().min(1, "Barkod kiritish majburiy"),
  // coerce.number() avtomatik stringni numberga o'tkazadi
  price: z.coerce.number().min(0, "Narx manfiy bo'lishi mumkin emas"),
  originalPrice: z.coerce.number().optional(),
  currency: z.enum(["UZS", "USD"]).default("UZS"),
  stock: z.coerce.number().min(0, "Soni manfiy bo'lishi mumkin emas"),
  unit: z.string().default("dona"),
  categoryId: z.coerce.number().optional(),
});

type EditProductFormValues = z.infer<typeof editProductSchema>;

interface EditProductDialogProps {
  product: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: any[];
}

export function EditProductDialog({ product, open, onOpenChange, categories = [] }: EditProductDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditProductFormValues>({
    resolver: zodResolver(editProductSchema) as Resolver<EditProductFormValues>,
    defaultValues: {
      name: "",
      barcode: "",
      price: 0,
      originalPrice: 0,
      currency: "UZS",
      stock: 0,
      unit: "dona",
    },
  });

  // Product o'zgarganda formni yangilash
  useEffect(() => {
    if (product && open) {
      form.reset({
        name: product.name || "",
        barcode: product.barcode || "",
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || 0,
        currency: product.currency || "UZS",
        stock: Number(product.stock) || 0,
        unit: product.unit || "dona",
        categoryId: product.categoryId || undefined,
      });
    }
  }, [product, open, form]);

  const updateMutation = useMutation({
    mutationFn: (data: EditProductFormValues) => productService.update(product.id, data),
    onSuccess: () => {
      toast.success("Mahsulot yangilandi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      // Backenddan kelgan aniq xatoni ko'rsatish
      const msg = error?.response?.data?.message || error?.message || "Xatolik yuz berdi";
      toast.error(msg);
    },
  });

  const onSubmit = (data: EditProductFormValues) => {
    updateMutation.mutate(data);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <Package className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                Mahsulotni tahrirlash
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Mahsulot ma'lumotlarini yangilash
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* ASOSIY MA'LUMOTLAR */}
              <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Nomlanishi</FormLabel>
                          <FormControl>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input placeholder="Coca Cola 1.5L" {...field} className="pl-10 h-11 bg-white dark:bg-black/20 rounded-xl" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Barkod *</FormLabel>
                          <FormControl>
                            <div className="relative">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input placeholder="1234567890" {...field} className="pl-10 h-11 bg-white dark:bg-black/20 rounded-xl" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Soni (Omborda)</FormLabel>
                          <FormControl>
                             <div className="relative">
                                <Cuboid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input type="number" {...field} className="pl-10 h-11 bg-white dark:bg-black/20 rounded-xl" />
                             </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>

                 <FormField
                   control={form.control}
                   name="categoryId"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className="text-sm font-medium">Kategoriya</FormLabel>
                       <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                         <FormControl>
                           <SelectTrigger className="h-11 bg-white dark:bg-black/20 rounded-xl">
                             <div className="flex items-center gap-2">
                               <Layers className="w-4 h-4 text-[#00B8D9]" />
                               <SelectValue placeholder="Kategoriyani tanlang" />
                             </div>
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           {categories.map((category: any) => (
                             <SelectItem key={category.id} value={category.id.toString()}>
                               {category.name}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
              </div>

              <Separator className="bg-gray-100 dark:bg-white/10" />

              {/* NARXLAR */}
              <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-[#00B8D9]/10 rounded-lg">
                        <DollarSign className="w-4 h-4 text-[#00B8D9]" />
                    </div>
                    <span className="text-sm font-bold">Narx Siyosati</span>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Sotuv</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-white dark:bg-[#1C2C30] rounded-lg text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Kelish</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-white dark:bg-[#1C2C30] rounded-lg text-sm" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Valyuta</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-10 bg-white dark:bg-[#1C2C30] rounded-lg text-sm">
                                <SelectValue placeholder="Valyuta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="UZS">UZS</SelectItem>
                                <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
              </div>

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="h-11 rounded-xl">
                    Bekor qilish
                </Button>
                <Button 
                    type="submit" 
                    disabled={updateMutation.isPending} 
                    className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white h-11 rounded-xl px-8 font-bold shadow-lg shadow-[#00B8D9]/25 transition-all active:scale-95"
                >
                  {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Saqlash"}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}