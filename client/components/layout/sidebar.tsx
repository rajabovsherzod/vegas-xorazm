"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  Store,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { setSidebarCookie } from "@/lib/sidebar-cookie";

const menuItems = [
  { text: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { text: "Buyurtmalar", icon: ShoppingCart, path: "/dashboard/orders" },
  { text: "Mahsulotlar", icon: Package, path: "/dashboard/products" },
  { text: "Xodimlar", icon: Users, path: "/dashboard/users" },
  { text: "Sozlamalar", icon: Settings, path: "/dashboard/settings" },
];

interface SidebarProps {
  defaultOpen: boolean;
}

export function Sidebar({ defaultOpen }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setSidebarCookie(newState);
  };

  // Sidebarning yopiq holatdagi kengligi (Icon container bilan bir xil bo'lishi shart)
  const COLLAPSED_WIDTH = "w-[80px]";
  const EXPANDED_WIDTH = "w-[280px]";

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] z-50",
        "transition-[width] duration-300 ease-in-out will-change-[width]", // Silliq animatsiya
        isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH
      )}
    >
      
      {/* --- TOGGLE BUTTON --- */}
      <div className="absolute -right-3 top-9 z-50">
        <button
          onClick={toggleSidebar}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-transform hover:bg-gray-100 hover:text-primary dark:border-white/10 dark:bg-[#1C2C30] dark:text-white"
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform duration-300", !isOpen && "rotate-180")} />
        </button>
      </div>

      {/* --- HEADER (LOGO) --- */}
      <div className="flex h-24 items-center overflow-hidden">
        {/* LOGO IKONKASI (Fixed Container) */}
        {/* Bu div har doim 80px turadi, shuning uchun ikonka qimirlamaydi */}
        <div className="min-w-[80px] h-full flex items-center justify-center shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00B8D9] to-[#5EEAD4] text-white shadow-lg shadow-[#00B8D9]/20">
            <Store className="h-5 w-5" />
          </div>
        </div>
        
        {/* LOGO MATNI (Silliq chiqadi) */}
        <div className={cn(
          "whitespace-nowrap transition-all duration-300 origin-left flex flex-col justify-center",
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"
        )}>
          <span className="text-xl font-extrabold text-[#212B36] dark:text-white leading-none tracking-tight">Vegas</span>
        </div>
      </div>

      {/* --- MENU --- */}
      <div className="flex-1 space-y-2 overflow-x-hidden py-4">
        <TooltipProvider delayDuration={0}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.path}
                    className={cn(
                      "group flex items-center h-12 relative transition-all duration-200 mx-3 rounded-xl overflow-hidden", // mx-3 orqali chetlardan ozgina joy qoldiramiz
                      isActive 
                        ? "bg-[#00B8D9]/10 text-[#00B8D9]" 
                        : "text-[#637381] dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/5 hover:text-[#212B36] dark:hover:text-white",
                    )}
                  >
                    {/* 🔥 SIR SHU YERDA: IKONKA KONTEYNERI */}
                    {/* Bu konteyner sidebarni mx-3 (margin) ni hisobga olib markazlashtiradi */}
                    {/* Sidebar 80px. Margin 12px (mx-3). Qoladi 56px. */}
                    <div className="min-w-[56px] h-full flex items-center justify-center shrink-0">
                      <item.icon className={cn("h-6 w-6 transition-colors", isActive && "text-[#00B8D9]")} />
                    </div>

                    {/* MATN */}
                    <span className={cn(
                      "font-bold text-[14px] whitespace-nowrap transition-all duration-300",
                      isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 overflow-hidden w-0"
                    )}>
                      {item.text}
                    </span>

                    {/* AKTIV INDIKATOR */}
                    {isActive && (
                      <div className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-[#00B8D9] transition-all duration-300",
                        !isOpen && "hidden" // Yopiq payti chiziqcha ko'rinmasin (xunuk turmasligi uchun)
                      )} />
                    )}
                  </Link>
                </TooltipTrigger>
                
                {/* TOOLTIP: Faqat yopiq bo'lsa */}
                {!isOpen && (
                  <TooltipContent side="right" className="bg-[#212B36] text-white border-0 font-bold ml-2">
                    {item.text}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      {/* --- FOOTER --- */}
      <div className="p-3 border-t border-gray-200 dark:border-white/5 mt-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className={cn(
                  "w-full h-12 flex items-center rounded-xl text-[#FF5630] hover:bg-[#FF5630]/10 hover:text-[#FF5630] transition-all relative overflow-hidden",
                )}
              >
                {/* Ikonka Konteyneri (Fixed) */}
                <div className="min-w-[56px] h-full flex items-center justify-center shrink-0">
                  <LogOut className="h-5 w-5" />
                </div>
                
                {/* Matn */}
                <span className={cn(
                  "font-bold text-[14px] whitespace-nowrap transition-all duration-300",
                  isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 overflow-hidden w-0"
                )}>
                  Chiqish
                </span>
              </button>
            </TooltipTrigger>
            {!isOpen && <TooltipContent side="right" className="bg-[#FF5630] text-white border-0 font-bold ml-2">Chiqish</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>

    </aside>
  );
}