"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { User, Lock } from "lucide-react";

// Biz ajratgan schema va tiplar (Bular borligiga ishonch hosil qiling: src/lib/validations/auth.ts)
import { loginSchema, LoginValues } from "@/lib/validations/auth";

// UI Komponentlar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 1. Form Hook
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // 2. Submit Logikasi
  async function onSubmit(data: LoginValues) {
    setIsLoading(true);

    try {
      // A) Login qilish
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Kirishda xatolik", {
          description: "Login yoki parol noto'g'ri",
        });
        setIsLoading(false);
        return;
      }

      // B) Rolni aniqlash
      // Token yangilanishi uchun majburiy refresh beramiz (Cookie o'tirishi uchun)
      const session = await getSession();
      const role = session?.user?.role;
      const name = session?.user?.name;

      toast.success(`Xush kelibsiz, ${name || "Foydalanuvchi"}!`);

      // Router keshini yangilaymiz
      router.refresh();

      // C) Rolga qarab yo'naltirish (Replace - ortga qaytmaslik uchun)
      switch (role) {
        case "owner":
          router.replace("/owner/dashboard");
          break;
        case "admin":
          router.replace("/admin/orders");
          break;
        case "seller":
          router.replace("/seller/pos");
          break;
        default:
          router.replace("/"); // Agar roli noaniq bo'lsa
      }

    } catch (error) {
      console.error(error);
      toast.error("Tizim xatoligi", {
        description: "Server bilan aloqa yo'q",
      });
      setIsLoading(false);
    }
    // Izoh: Muvaffaqiyatli bo'lsa setIsLoading(false) qilmaymiz, 
    // sahifa almashguncha spinner aylanib turishi kerak (UX).
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* LOGIN FIELD */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#212B36] dark:text-white font-bold pl-1">Login</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919EAB]" />
                  <Input 
                    placeholder="admin" 
                    className="h-12 pl-12 rounded-xl border-[#919EAB]/30 bg-[#F9FAFB] dark:bg-[#132326] dark:border-white/10 dark:text-white focus:bg-white dark:focus:bg-[#132326] focus:border-[#00B8D9] focus:ring-4 focus:ring-[#00B8D9]/10 text-base font-medium transition-all"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PASSWORD FIELD */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center pl-1 pr-1">
                <FormLabel className="text-[#212B36] dark:text-white font-bold">Parol</FormLabel>
                <a href="#" className="text-xs font-bold text-[#00B8D9] hover:underline">Unutdingizmi?</a>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919EAB]" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 pl-12 rounded-xl border-[#919EAB]/30 bg-[#F9FAFB] dark:bg-[#132326] dark:border-white/10 dark:text-white focus:bg-white dark:focus:bg-[#132326] focus:border-[#00B8D9] focus:ring-4 focus:ring-[#00B8D9]/10 text-base font-medium transition-all"
                    {...field} 
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* BUTTON */}
        <Button 
          type="submit" 
          className="w-full h-12 text-[15px] rounded-xl shadow-cyan mt-2 bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white" 
          disabled={isLoading}
        >
          {isLoading ? <Spinner className="mr-2 text-white" size="sm" /> : "Tizimga kirish"}
        </Button>

      </form>
    </Form>
  );
}