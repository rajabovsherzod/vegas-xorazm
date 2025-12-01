"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar"; // 👈 Rasmiy Trigger
import { Separator } from "@/components/ui/separator";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-[#132326]/80 backdrop-blur-md px-4 sticky top-0 z-10">
      
      {/* CHAP TOMON: Trigger tugmasi */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h2 className="text-sm font-bold text-[#212B36] dark:text-white">
          {user?.role === 'owner' ? 'Boshqaruv Paneli' : 'Sotuv Bo\'limi'}
        </h2>
      </div>

      {/* O'NG TOMON */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-white/10">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-[#212B36] dark:text-white leading-none">{user?.name}</p>
            <p className="text-xs text-[#00B8D9] font-bold uppercase mt-1">{user?.role}</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-white dark:border-[#132326] shadow-sm cursor-pointer">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.name}&background=00B8D9&color=fff`} />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}