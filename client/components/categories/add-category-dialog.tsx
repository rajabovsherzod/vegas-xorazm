"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Layers } from "lucide-react";
import * as z from "zod";

import { useCreateCategory } from "@/hooks/mutations/use-category";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const createCategorySchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  description: z.string().optional(),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate, isPending } = useCreateCategory(() => {
      setOpen(false);
      form.reset();
  });

  const onSubmit = (data: CreateCategoryFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00B8D9] to-[#00A2C0] hover:from-[#00A2C0] hover:to-[#008B9E] text-white font-bold shadow-lg shadow-[#00B8D9]/30 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" /> Kategoriya qo'shish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <Layers className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                Yangi Kategoriya
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Mahsulotlar uchun kategoriya yaratish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Kategoriya nomi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="Masalan: Ichimliklar" 
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Tavsif (Ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Qisqacha tavsif..." 
                        {...field} 
                        className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-4">
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











import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Layers } from "lucide-react";
import * as z from "zod";

import { useCreateCategory } from "@/hooks/mutations/use-category";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const createCategorySchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  description: z.string().optional(),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate, isPending } = useCreateCategory(() => {
      setOpen(false);
      form.reset();
  });

  const onSubmit = (data: CreateCategoryFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00B8D9] to-[#00A2C0] hover:from-[#00A2C0] hover:to-[#008B9E] text-white font-bold shadow-lg shadow-[#00B8D9]/30 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" /> Kategoriya qo'shish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <Layers className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                Yangi Kategoriya
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Mahsulotlar uchun kategoriya yaratish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Kategoriya nomi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="Masalan: Ichimliklar" 
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Tavsif (Ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Qisqacha tavsif..." 
                        {...field} 
                        className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-4">
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












import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Layers } from "lucide-react";
import * as z from "zod";

import { useCreateCategory } from "@/hooks/mutations/use-category";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const createCategorySchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  description: z.string().optional(),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate, isPending } = useCreateCategory(() => {
      setOpen(false);
      form.reset();
  });

  const onSubmit = (data: CreateCategoryFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00B8D9] to-[#00A2C0] hover:from-[#00A2C0] hover:to-[#008B9E] text-white font-bold shadow-lg shadow-[#00B8D9]/30 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" /> Kategoriya qo'shish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <Layers className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                Yangi Kategoriya
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Mahsulotlar uchun kategoriya yaratish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Kategoriya nomi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="Masalan: Ichimliklar" 
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Tavsif (Ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Qisqacha tavsif..." 
                        {...field} 
                        className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-4">
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











import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Layers } from "lucide-react";
import * as z from "zod";

import { useCreateCategory } from "@/hooks/mutations/use-category";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";

const createCategorySchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  description: z.string().optional(),
});

type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;

export function AddCategoryDialog() {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutate, isPending } = useCreateCategory(() => {
      setOpen(false);
      form.reset();
  });

  const onSubmit = (data: CreateCategoryFormValues) => {
    mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#00B8D9] to-[#00A2C0] hover:from-[#00A2C0] hover:to-[#008B9E] text-white font-bold shadow-lg shadow-[#00B8D9]/30 transition-all active:scale-95 h-10 px-6 rounded-xl">
          <Plus className="mr-2 h-5 w-5" /> Kategoriya qo'shish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1C2C30] border-none p-0 overflow-hidden rounded-2xl shadow-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-5 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-3 text-[#212B36] dark:text-white">
              <div className="p-2.5 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <Layers className="w-5 h-5 text-[#00B8D9]" />
              </div>
              <div>
                Yangi Kategoriya
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Mahsulotlar uchun kategoriya yaratish
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Kategoriya nomi</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                          placeholder="Masalan: Ichimliklar" 
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-200">Tavsif (Ixtiyoriy)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Qisqacha tavsif..." 
                        {...field} 
                        className="h-11 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] transition-all rounded-xl font-medium" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-4">
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











