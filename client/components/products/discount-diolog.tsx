"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { uz } from "date-fns/locale"; 
import { CalendarIcon, Loader2, Percent, Tag, Ban, Save, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn, formatCurrency } from "@/lib/utils";

// Schema
const discountFormSchema = z.object({
  percent: z.coerce.number().min(1).max(99, "1% dan 99% gacha bo'lishi kerak"),
  endDate: z.date().refine((date) => date > new Date(), {
    message: "Tugash sanasi kelajakda bo'lishi kerak",
  }),
});

interface DiscountDialogProps {
  product: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscountDialog({ product, open, onOpenChange }: DiscountDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof discountFormSchema>>({
    resolver: zodResolver(discountFormSchema) as Resolver<z.infer<typeof discountFormSchema>>,
    defaultValues: {
      percent: 0,
    },
  });

  const percentValue = form.watch("percent");
  const calculatedPrice = product 
    ? Number(product.price) - (Number(product.price) * (percentValue || 0) / 100)
    : 0;

  const hasActiveDiscount = Number(product?.discountPrice) > 0;

  // MUTATION: Chegirma qo'yish
  const discountMutation = useMutation({
    mutationFn: async (values: z.infer<typeof discountFormSchema>) => {
      return await api.post(`/products/${product.id}/discount`, {
        percent: values.percent,
        endDate: values.endDate.toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Chegirma muvaffaqiyatli qo'yildi!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (err: any) => toast.error(err.message || "Xatolik"),
  });

  // MUTATION: Chegirmani o'chirish
  const removeMutation = useMutation({
    mutationFn: async () => api.delete(`/products/${product.id}/discount`),
    onSuccess: () => {
      toast.success("Chegirma olib tashlandi");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onOpenChange(false);
    }
  });

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/80 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-[#00B8D9]/10 rounded-xl text-[#00B8D9]">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                Chegirma Belgilash
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  {product.name}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => discountMutation.mutate(data))} className="space-y-6">
              
              {/* 1. FOIZ KIRITISH */}
              <FormField
                control={form.control}
                name="percent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Chegirma foizi (%)
                    </FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 bg-gray-100 dark:bg-white/10 rounded-lg text-gray-500 group-focus-within:text-[#00B8D9] group-focus-within:bg-[#00B8D9]/10 transition-colors">
                           <Percent className="w-4 h-4" />
                        </div>
                        <Input 
                          type="number" 
                          placeholder="10" 
                          className="pl-12 h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] rounded-xl font-bold text-lg transition-all" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    
                    {/* --- NARX PREVIEW (TOZALANGAN) --- */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-between group">
                      
                      {/* Eski narx */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Asl Narx</span>
                        <div className="relative">
                           <span className="text-base font-semibold text-gray-500 dark:text-gray-400">
                             {formatCurrency(Number(product.price), product.currency)}
                           </span>
                           {/* Chiziq */}
                           <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-rose-500/60 -rotate-2" />
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />

                      {/* Yangi narx */}
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-[#00B8D9] uppercase tracking-wider mb-0.5">Aksiya Narxi</span>
                        <span className="text-xl font-black text-[#212B36] dark:text-white tracking-tight">
                          {formatCurrency(calculatedPrice, product.currency)}
                        </span>
                      </div>
                    </div>
                    
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2. SANA TANLASH */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Amal qilish muddati (gacha)
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-medium h-12 bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9]",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#00B8D9]" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: uz })
                            ) : (
                              <span>Sanani tanlang</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      
                      {/* CALENDAR STYLE FIX */}
                      <PopoverContent className="w-auto p-0 bg-white dark:bg-[#1C2C30] border-gray-200 dark:border-white/10 shadow-xl rounded-xl z-[9999]" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          locale={uz}
                          className="p-3"
                          classNames={{
                            // 🔥 TANLANGAN KUN RANGI (Teal/Feruz)
                            day_selected: "!bg-[#00B8D9] !text-white hover:bg-[#00B8D9]/90 focus:bg-[#00B8D9]",
                            // Bugungi kun
                            day_today: "bg-gray-100 dark:bg-white/10 text-foreground font-semibold rounded-md",
                            // Hover
                            day: cn("h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors"),
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FOOTER BUTTONS */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-white/5">
                
                {/* 1. TO'XTATISH (Yumshoq Qizil) */}
                {hasActiveDiscount ? (
                   <Button 
                     type="button" 
                     variant="ghost" 
                     onClick={() => removeMutation.mutate()}
                     disabled={removeMutation.isPending}
                     className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 h-11 px-4 rounded-xl font-bold transition-all active:scale-95"
                   >
                     {removeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                     To'xtatish
                   </Button>
                ) : (
                   <div /> 
                )}

                <div className="flex gap-3">
                  {/* 2. BEKOR QILISH */}
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="h-11 px-6 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 font-medium"
                  >
                    Bekor qilish
                  </Button>

                  {/* 3. SAQLASH (Asosiy Rang) */}
                  <Button 
                    type="submit" 
                    disabled={discountMutation.isPending}
                    className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white h-11 rounded-xl px-8 font-bold shadow-lg shadow-[#00B8D9]/25 transition-all active:scale-95"
                  >
                    {discountMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Saqlash
                      </>
                    )}
                  </Button>
                </div>
              </div>

            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}