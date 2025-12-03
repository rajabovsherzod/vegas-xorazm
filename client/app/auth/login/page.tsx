// "use client" shart emas, chunki bu shunchaki wrapper (qobiq).
// Asosiy logika "LoginForm" (client component) ichida.

import Image from "next/image";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LoginForm } from "@/components/auth/login-form";

// 👇 MANA SHU "export default" BO'LISHI SHART!
export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#F4F6F8] dark:bg-[#0D1B1E] p-4 overflow-hidden transition-colors duration-500">

      {/* Theme Toggle */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      {/* Orqa fon bezaklari */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00B8D9]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#00B8D9]/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Asosiy Karta */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#1C2C30] rounded-[24px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-none border border-transparent dark:border-white/10 p-8 sm:p-10 relative z-10 animate-in fade-in zoom-in duration-500">

        {/* Logo Qismi */}
        <div className="flex flex-col items-center text-center mb-8 space-y-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden shadow-lg shadow-[#00B8D9]/30">
            <Image
              src="/white-logo.jpg"
              alt="Vegas CRM Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#212B36] dark:text-white tracking-tight">Vegas CRM</h1>
            <p className="text-[#637381] dark:text-[#919EAB] font-medium text-sm mt-1">Tizimga xush kelibsiz</p>
          </div>
        </div>

        {/* 🔥 FORM KOMPONENTI */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[#919EAB] text-xs font-medium">
            &copy; 2025 Vegas CRM. Barcha huquqlar himoyalangan.
          </p>
        </div>

      </div>
    </div>
  );
}