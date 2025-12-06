"use client";

import { useState, useMemo } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, UserPlus, Wallet, Clock, ShieldCheck, User, UserCircle } from "lucide-react";

import { createUserSchema, CreateUserFormValues } from "@/lib/validations/user";
import { useCreateUser } from "@/hooks/mutations/use-user";

// Shadcn UI
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

// --- YORDAMCHI: Vaqt generatsiyasi (08:00 dan 23:00 gacha) ---
const generateTimeSlots = () => {
  const times = [];
  for (let i = 8; i <= 23; i++) {
    const hour = i.toString().padStart(2, "0");
    times.push(`${hour}:00`);
    times.push(`${hour}:30`);
  }
  return times;
};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema) as Resolver<CreateUserFormValues>,
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      role: "seller", // Default
      fixSalary: 0,
      bonusPercent: 0,
      finePerHour: 0,
      workStartTime: "09:00",
    },
  });

  const { mutate, isPending } = useCreateUser(() => {
      setOpen(false);
      form.reset();
  });

  const onSubmit = (data: CreateUserFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00B8D9] to-[#00A2C0] hover:from-[#00A2C0] hover:to-[#008B9E] text-white font-bold shadow-lg shadow-[#00B8D9]/30 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" /> Xodim qo'shish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <UserPlus className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                Yangi Xodim
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Tizimga yangi foydalanuvchi qo'shish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 1. SECTION: SHAXSIY MA'LUMOTLAR */}
              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Shaxsiy Ma'lumotlar</h4>
                 <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">F.I.SH</FormLabel>
                          <FormControl>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="Masalan: Eshmatov Toshmat" 
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Login</FormLabel>
                          <FormControl>
                            <div className="relative">
                                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    placeholder="login123" 
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
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Parol</FormLabel>
                          <FormControl>
                             <Input 
                                type="password" 
                                placeholder="••••••" 
                                {...field} 
                                className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 </div>
              </div>

              <Separator className="bg-gray-100 dark:bg-white/10" />

              {/* 2. SECTION: SOZLAMALAR */}
              <div className="space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Sozlamalar</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Lavozim</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] rounded-xl font-medium">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#00B8D9]" />
                                    <SelectValue placeholder="Tanlang" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 shadow-lg z-[9999]">
                              {/* 🔥 ROLLAR O'ZGARTIRILDI */}
                              <SelectItem value="admin" className="cursor-pointer focus:bg-[#00B8D9]/10 focus:text-[#00B8D9] font-medium py-2.5">
                                Administrator
                              </SelectItem>
                              <SelectItem value="cashier" className="cursor-pointer focus:bg-[#00B8D9]/10 focus:text-[#00B8D9] font-medium py-2.5">
                                Kassir
                              </SelectItem>
                              <SelectItem value="seller" className="cursor-pointer focus:bg-[#00B8D9]/10 focus:text-[#00B8D9] font-medium py-2.5">
                                Sotuvchi (Seller)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Ish vaqti</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] rounded-xl font-medium">
                                 <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#00B8D9]" />
                                    <SelectValue placeholder="Vaqt" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="h-[200px] rounded-xl bg-white dark:bg-[#1C2C30] border-gray-100 dark:border-white/10 shadow-lg z-[9999]">
                                {timeSlots.map(time => (
                                    <SelectItem key={time} value={time} className="cursor-pointer focus:bg-[#00B8D9]/10 focus:text-[#00B8D9]">{time}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
              </div>
              
              {/* 3. SECTION: MOLIYA */}
               <div className="bg-gray-50/50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5">
                 <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 bg-[#00B8D9]/10 rounded-lg">
                        <Wallet className="w-4 h-4 text-[#00B8D9]" />
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-white">Moliya</span>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="fixSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Oylik (Fix)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-lg font-mono text-sm" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bonusPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase">Bonus (%)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-lg font-mono text-sm" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="finePerHour"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[11px] font-semibold text-red-500/80 uppercase">Jarima/soat</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} className="h-10 bg-white dark:bg-[#1C2C30] border border-red-100 dark:border-red-900/20 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all rounded-lg font-mono text-sm text-red-500" />
                          </FormControl>
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