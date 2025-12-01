"use client";

import { useState, useMemo } from "react";
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
  FileText,
  BadgeDollarSign
} from "lucide-react"; // Barcha kerakli ikonkalarni import qilamiz
import { signOut } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { setSidebarCookie } from "@/lib/sidebar-cookie";

// Ikonka nomi va komponentni bog'lash
const iconMap = {
  LayoutDashboard: LayoutDashboard,
  ShoppingCart: ShoppingCart,
  Package: Package,
  Users: Users,
  Settings: Settings,
  LogOut: LogOut,
  Store: Store,
  FileText: FileText,
  BadgeDollarSign: BadgeDollarSign,
};

// Navigatsiya elementi tipi
export interface NavItem {
  text: string;
  url: string;
  icon: keyof typeof iconMap | 'LogOut'; // LogOutni qo'lda qo'shamiz, chunki u configda yo'q
}

interface SidebarProps {
  defaultOpen: boolean;
  navItems: NavItem[]; 
  className?: string;
}

// 🔥 YANGILANGAN EKSPORT NOMI VA PROPS
export function AppSidebar({ defaultOpen, navItems, className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleSidebar = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setSidebarCookie(newState);
  };

  // Navigatsiya ro'yxati (LogOutsiz)
  const navigationItems = useMemo(() => {
    return navItems.map(item => {
      // Icon string nomini haqiqiy komponentga bog'lash
      const IconComponent = iconMap[item.icon as keyof typeof iconMap];
      return {
        ...item,
        Icon: IconComponent,
      };
    });
  }, [navItems]);


  const COLLAPSED_WIDTH = "w-[80px]";
  const EXPANDED_WIDTH = "w-[280px]";

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] z-50",
        "transition-[width] duration-300 cubic-bezier(0.4, 0, 0.2, 1)", // Silliq animatsiya
        isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        className
      )}
    >
      
      {/* --- TOGGLE BUTTON (DIZAYN O'ZGARIShSIZ QOLDI) --- */}
      <div className="absolute -right-3 top-9 z-50">
        <button
          onClick={toggleSidebar}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-md transition-transform hover:bg-gray-100 hover:text-primary dark:border-white/10 dark:bg-[#1C2C30] dark:text-white"
        >
          <ChevronLeft className={cn("h-3 w-3 transition-transform duration-300", !isOpen && "rotate-180")} />
        </button>
      </div>

      {/* --- HEADER (LOGO) (DIZAYN O'ZGARIShSIZ QOLDI) --- */}
      <div className="flex h-24 items-center overflow-hidden">
        {/* LOGO IKONKASI (Fixed Container) */}
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

      {/* --- MENU (DINAMIK MAP QILINDI) --- */}
      <div className="flex-1 space-y-2 overflow-x-hidden py-4">
        <TooltipProvider delayDuration={0}>
          {navigationItems.map((item) => { // ✅ Endi prop orqali kelgan elementlar
            const isActive = pathname === item.url; 
            const Icon = item.Icon; // ✅ Dinamik Ikonka komponenti
            
            return (
              <Tooltip key={item.url} disableHoverableContent={isOpen}> 
                <TooltipTrigger asChild>
                  <Link
                    href={item.url}
                    className={cn(
                      "group flex items-center h-12 relative transition-all duration-200 mx-3 rounded-xl overflow-hidden", 
                      isActive 
                        ? "bg-[#00B8D9]/10 text-[#00B8D9] hover:bg-[#00B8D9]/15 hover:text-[#00B8D9]" 
                        : "text-[#637381] dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-white/5 hover:text-[#212B36] dark:hover:text-white",
                    )}
                  >
                    {/* IKONKA KONTEYNERI (Fixed Position) */}
                    <div className="min-w-[56px] h-full flex items-center justify-center shrink-0">
                      <Icon className={cn("h-6 w-6 transition-colors", isActive && "text-[#00B8D9]")} />
                    </div>

                    {/* MATN */}
                    <span className={cn(
                      "font-bold text-[14px] whitespace-nowrap transition-all duration-300",
                      isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 w-0 overflow-hidden"
                    )}>
                      {item.text}
                    </span>

                    {/* AKTIV INDIKATOR */}
                    {isActive && (
                      <div className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-[#00B8D9] transition-all duration-300",
                        !isOpen && "opacity-0" 
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

      {/* --- FOOTER (LOGOUT) (DIZAYN O'ZGARIShSIZ QOLDI) --- */}
      <div className="p-3 border-t border-gray-200 dark:border-white/5 mt-auto">
        <TooltipProvider>
          <Tooltip disableHoverableContent={isOpen}>
            <TooltipTrigger asChild>
              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
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
                  isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10 w-0 overflow-hidden"
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