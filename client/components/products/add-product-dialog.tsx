"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Package, Barcode, DollarSign, Cuboid, Layers } from "lucide-react";

import { createProductSchema, CreateProductFormValues } from "@/lib/validations/product";
import { useCreateProduct } from "@/hooks/mutations/use-product";

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
import { Separator } from "@/components/ui/separator";

interface AddProductDialogProps {
  categories: any[];
}

export function AddProductDialog({ categories = [] }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
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

  const { mutate, isPending } = useCreateProduct(() => {
      setOpen(false);
      form.reset();
  });

  const onSubmit = (data: CreateProductFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00B8D9] to-[#00A2C0] hover:from-[#00A2C0] hover:to-[#008B9E] text-white font-bold shadow-lg shadow-[#00B8D9]/30 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" /> Mahsulot qo'shish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <Package className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                Yangi Mahsulot
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Omborga yangi tovar kiritish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 1. SECTION: ASOSIY MA'LUMOTLAR */}
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Asosiy Ma'lumotlar</h4>
                 <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Nomlanishi</FormLabel>
                          <FormControl>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Masalan: Coca Cola 1.5L" 
                                    {...field} 
                                    className="pl-10 h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                                />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
                 <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Barkod *</FormLabel>
                          <FormControl>
                            <div className="relative">
                                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Masalan: 1234567890" 
                                    {...field} 
                                    className="pl-10 h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                                />
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
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Soni (Omborda)</FormLabel>
                          <FormControl>
                             <div className="relative">
                                <Cuboid className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    type="number" 
                                    placeholder="0" 
                                    {...field} 
                                    className="pl-10 h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                                />
                             </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">O'lchov Birligi</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] rounded-xl font-medium">
                                <SelectValue placeholder="Tanlang" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 z-[9999]">
                                <SelectItem value="dona">Dona</SelectItem>
                                <SelectItem value="kg">Kg</SelectItem>
                                <SelectItem value="metr">Metr</SelectItem>
                                <SelectItem value="litr">Litr</SelectItem>
                                <SelectItem value="blok">Blok</SelectItem>
                                <SelectItem value="qop">Qop</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>

                 {/* Category Selector */}
                 <FormField
                   control={form.control}
                   name="categoryId"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Kategoriya</FormLabel>
                       <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                         <FormControl>
                           <SelectTrigger className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] rounded-xl font-medium">
                             <div className="flex items-center gap-2">
                               <Layers className="w-4 h-4 text-[#00B8D9]" />
                               <SelectValue placeholder="Kategoriyani tanlang" />
                             </div>
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 z-[9999]">
                           {categories.length === 0 ? (
                             <div className="p-2 text-center text-sm text-muted-foreground">
                               Kategoriya topilmadi
                             </div>
                           ) : (
                             categories.map((category: any) => (
                               <SelectItem key={category.id} value={category.id.toString()}>
                                 {category.name}
                               </SelectItem>
                             ))
                           )}
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
              </div>

              <Separator className="bg-gray-100 dark:bg-white/10" />

              {/* 2. SECTION: NARXLAR */}
              <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-[#00B8D9]/10 rounded-lg">
                        <DollarSign className="w-4 h-4 text-[#00B8D9]" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-white">Narx Siyosati</span>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Sotuv Narxi</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-lg font-mono text-sm" />
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
                          <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Kelish Narxi</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-lg font-mono text-sm" />
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
                              <SelectTrigger className="h-10 bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] rounded-lg text-sm">
                                <SelectValue placeholder="Valyuta" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 z-[9999]">
                                <SelectItem value="UZS">UZS (So'm)</SelectItem>
                                <SelectItem value="USD">USD (Dollar)</SelectItem>
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
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-11 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 font-semibold">
                    Bekor qilish
                </Button>
                <Button 
                    type="submit" 
                    disabled={isPending} 
                    className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white h-11 rounded-xl px-8 font-bold shadow-lg shadow-[#00B8D9]/25 transition-all active:scale-95"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Saqlash"}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

