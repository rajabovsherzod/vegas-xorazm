"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutDashboard, User, Lock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { ThemeToggle } from "@/components/theme/theme-toggle"; // Yo'l to'g'riligini tekshiring

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F4F6F8] dark:bg-[#0D1B1E] p-4 overflow-hidden transition-colors duration-500">
      
      {/* ☀️/🌙 THEME TOGGLE */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* 🎨 ORQA FON (Bezaklar qoldi, lekin ular endi karta orqasida turadi) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00B8D9]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00B8D9]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 🔲 ASOSIY KARTA (SOLID - Blur yo'q) */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#1C2C30] rounded-[24px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-transparent dark:border-white/10 p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* LOGO & TITLE */}
        <div className="flex flex-col items-center text-center mb-8 space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#00B8D9] to-[#5EEAD4] flex items-center justify-center shadow-lg shadow-[#00B8D9]/30">
            <LayoutDashboard className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#212B36] dark:text-white tracking-tight">Vegas CRM</h1>
            <p className="text-[#637381] dark:text-[#919EAB] font-medium text-sm mt-1">Tizimga xush kelibsiz</p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmit} className="space-y-6">
          
          {/* LOGIN INPUT */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-[#212B36] dark:text-white font-bold pl-1">Login</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919EAB]" />
              <Input 
                id="username" 
                placeholder="admin" 
                // Dark mode uchun input foni biroz to'qroq (#132326) bo'ladi
                className="h-12 pl-12 rounded-xl border-[#919EAB]/30 bg-[#F9FAFB] dark:bg-[#132326] dark:border-white/10 dark:text-white focus:bg-white dark:focus:bg-[#132326] focus:border-[#00B8D9] focus:ring-4 focus:ring-[#00B8D9]/10 text-base font-medium transition-all"
              />
            </div>
          </div>
          
          {/* PASSWORD INPUT */}
          <div className="space-y-2">
            <div className="flex justify-between items-center pl-1 pr-1">
              <Label htmlFor="password" className="text-[#212B36] dark:text-white font-bold">Parol</Label>
              <a href="#" className="text-xs font-bold text-[#00B8D9] hover:underline">
                Parolni unutdingizmi?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#919EAB]" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                className="h-12 pl-12 rounded-xl border-[#919EAB]/30 bg-[#F9FAFB] dark:bg-[#132326] dark:border-white/10 dark:text-white focus:bg-white dark:focus:bg-[#132326] focus:border-[#00B8D9] focus:ring-4 focus:ring-[#00B8D9]/10 text-base font-medium transition-all"
              />
            </div>
          </div>

          {/* BUTTON */}
          <Button 
            type="submit" 
            className="w-full h-12 text-[15px] rounded-xl shadow-cyan mt-2" 
            disabled={isLoading}
          >
            {/* Spinner uchun text-white qo'shdik, chunki button ko'k */}
            {isLoading ? <Spinner className="mr-2 text-white" size="md" /> : "Tizimga kirish"}
          </Button>

        </form>

        {/* FOOTER */}
        <div className="mt-8 text-center">
          <p className="text-[#919EAB] text-xs font-medium">
            &copy; 2025 Vegas CRM. Barcha huquqlar himoyalangan.
          </p>
        </div>

      </div>
    </div>
  );
}