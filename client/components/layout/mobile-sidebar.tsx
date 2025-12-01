"use client";

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
  Store,
  FileText,
  BadgeDollarSign,
  Menu,
  Layers,
} from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NavItem } from "./app-sidebar";

const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  Store,
  FileText,
  BadgeDollarSign,
  Layers,
};

interface MobileSidebarProps {
  navItems: NavItem[];
}

export function MobileSidebar({ navItems }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-gray-500 hover:bg-transparent hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px] bg-white dark:bg-[#132326] border-r border-gray-200 dark:border-white/10 z-[100]">
        {/* HEADER */}
        <SheetHeader className="h-24 flex flex-row items-center justify-start px-6 border-b border-gray-100 dark:border-white/5 space-y-0">
             <div className="flex items-center gap-3 w-full">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00B8D9] to-[#5EEAD4] text-white shadow-lg shadow-[#00B8D9]/20 shrink-0">
                    <Store className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-left">
                     <SheetTitle className="text-xl font-extrabold text-[#212B36] dark:text-white leading-none tracking-tight">
                        Vegas
                    </SheetTitle>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                        CRM System
                    </span>
                </div>
             </div>
        </SheetHeader>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 h-[calc(100vh-180px)]">
             {navItems.map((item) => {
                 const Icon = iconMap[item.icon as keyof typeof iconMap];
                 const isActive = pathname === item.url;

                 return (
                    <Link
                        key={item.url}
                        href={item.url}
                        className={cn(
                            "flex items-center h-12 px-3 rounded-xl transition-all duration-200 gap-3",
                            isActive 
                            ? "bg-[#00B8D9]/10 text-[#00B8D9]" 
                            : "text-[#637381] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-[#212B36] dark:hover:text-white"
                        )}
                    >
                        <Icon className={cn("w-5 h-5", isActive && "text-[#00B8D9]")} />
                        <span className="font-bold text-sm">{item.text}</span>
                    </Link>
                 );
             })}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-gray-200 dark:border-white/5 mt-auto w-full">
             <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full h-12 flex items-center px-3 rounded-xl text-[#FF5630] hover:bg-[#FF5630]/10 hover:text-[#FF5630] transition-all gap-3"
             >
                <LogOut className="w-5 h-5" />
                <span className="font-bold text-sm">Chiqish</span>
             </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

