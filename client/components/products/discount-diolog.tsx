"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Percent, Tag } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api/api-client"; // O'zingizdagi api client
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // Shadcn Calendar
import { cn, formatCurrency } from "@/lib/utils";

// Schema
const discountFormSchema = z.object({
  percent: z.coerce.number().min(1).max(99, "1% dan 99% gacha bo'lishi kerak"),
  endDate: z.date().refine((date) => date > new Date(), {
    message: "Tugash sanasi hoziridan keyin bo'lishi kerak",
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

  // Hisoblangan narxni ko'rsatish uchun
  const percentValue = form.watch("percent");
  const calculatedPrice = product 
    ? Number(product.price) - (Number(product.price) * (percentValue || 0) / 100)
    : 0;

  // MUTATION
  const discountMutation = useMutation({
    mutationFn: async (values: z.infer<typeof discountFormSchema>) => {
      // API ga yuborish
      return await api.post(`/products/${product.id}/discount`, {
        percent: values.percent,
        endDate: values.endDate.toISOString(), // ISO format
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

  // CHEGIRMANI O'CHIRISH
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
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#1C2C30]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-500" />
            Chegirma belgilash
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {product.name} uchun muddatli aksiya
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => discountMutation.mutate(data))} className="space-y-6 mt-4">
            
            {/* 1. FOIZ INPUT */}
            <FormField
              control={form.control}
              name="percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chegirma foizi (%)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        placeholder="10" 
                        className="pl-10 text-lg font-bold" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  
                  {/* PREVIEW: Eski va Yangi narxni ko'rsatish */}
                  <div className="flex items-center gap-2 text-sm mt-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-dashed">
                    <span className="line-through text-muted-foreground">
                      {formatCurrency(Number(product.price), product.currency)}
                    </span>
                    <span>→</span>
                    <span className="font-bold text-emerald-500">
                      {formatCurrency(calculatedPrice, product.currency)}
                    </span>
                  </div>
                  
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. SANA TANLASH (Date Picker) */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Amal qilish muddati (gacha)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Sanani tanlang</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()} // O'tib ketgan sanalarni o'chirish
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* BUTTONS */}
            <div className="flex justify-between pt-2">
              {/* Agar oldin chegirma bo'lsa, O'CHIRISH tugmasi chiqadi */}
              {Number(product.discountPrice) > 0 ? (
                 <Button 
                   type="button" 
                   variant="destructive" 
                   onClick={() => removeMutation.mutate()}
                   disabled={removeMutation.isPending}
                 >
                   {removeMutation.isPending ? "O'chirilmoqda..." : "Aksiyani to'xtatish"}
                 </Button>
              ) : (
                 <div /> // Bo'sh joy
              )}

              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                  Bekor qilish
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={discountMutation.isPending}>
                  {discountMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Tasdiqlash"}
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}