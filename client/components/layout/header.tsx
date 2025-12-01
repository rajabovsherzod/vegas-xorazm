"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BadgeDollarSign } from "lucide-react"; 
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { NavItem } from "@/components/layout/app-sidebar";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    username?: string;
  } | undefined;
  rate: string | null;
  navItems?: NavItem[];
}

export function Header({ user, rate, navItems = [] }: HeaderProps) {
  
  const displayName = user?.name || "Foydalanuvchi";
  const displayRole = user?.role || "Hodim";

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(displayName);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#132326]/80 backdrop-blur-md px-4 sticky top-0 z-10 transition-all duration-300">
      
      {/* CHAP TOMON */}
      <div className="flex items-center gap-2">
        <div className="md:hidden">
            <MobileSidebar navItems={navItems} />
        </div>
        <Separator orientation="vertical" className="mr-2 h-4 hidden md:block" />
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-[#212B36] dark:text-white capitalize leading-none">
            {user?.role === 'owner' ? 'Boshqaruv Paneli' : 'Sotuv Bo\'limi'}
          </h2>
        </div>
      </div>

      {/* O'NG TOMON */}
      <div className="flex items-center gap-4">
        
        {/* 💵 DOLLAR KURSI (SSR) */}
        {rate && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <BadgeDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              1 $ = {rate} UZS
            </span>
          </div>
        )}

        <ThemeToggle />
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-[#212B36] dark:text-white leading-none">
              {displayName}
            </p>
            <p className="text-xs text-[#00B8D9] font-bold uppercase mt-1">
              {displayRole}
            </p>
          </div>
          
          <Avatar className="h-9 w-9 border-2 border-white dark:border-[#132326] shadow-sm cursor-pointer bg-[#00B8D9]">
            <AvatarImage 
              src={`https://ui-avatars.com/api/?name=${displayName}&background=00B8D9&color=fff&bold=true`} 
              alt={displayName}
            />
            <AvatarFallback className="bg-[#00B8D9] text-white font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
