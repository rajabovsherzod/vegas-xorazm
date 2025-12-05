"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@/hooks/use-debounce";

// --- SEARCH INPUT COMPONENT ---
function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const initialValue = useRef(searchParams.get("search") || "");
  const [term, setTerm] = useState(initialValue.current);
  const debouncedTerm = useDebounce(term, 500);
  const prevDebouncedTerm = useRef(debouncedTerm);

  useEffect(() => {
    if (prevDebouncedTerm.current === debouncedTerm) return;
    prevDebouncedTerm.current = debouncedTerm;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedTerm) {
      params.set("search", debouncedTerm);
    } else {
      params.delete("search");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newUrl, { scroll: false });
  }, [debouncedTerm, pathname, router, searchParams]);

  return (
    // Desktopda (lg) w-[280px] qildik, juda keng bo'lib ketmasligi uchun
    <div className="relative w-full sm:w-[260px] lg:w-[280px] xl:w-[320px] transition-all duration-300">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
        <Search className="w-4 h-4" />
      </div>
      <Input
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className={cn(
          "pl-10 h-11 lg:h-10 w-full",
          "bg-gray-50 dark:bg-black/20",
          "border-gray-200 dark:border-white/10",
          "rounded-xl transition-all duration-200",
          "focus:bg-white dark:focus:bg-[#1C2C30]",
          "focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9]",
          "placeholder:text-muted-foreground/60 text-sm font-medium"
        )}
      />
    </div>
  );
}

// --- MAIN HEADER COMPONENT ---
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  searchPlaceholder?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  searchPlaceholder,
}: PageHeaderProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden w-full", // w-full qo'shildi
        "bg-white dark:bg-[#132326]",
        "border border-gray-200 dark:border-white/10",
        "rounded-2xl shadow-sm",
        "p-5 md:p-6",
        className
      )}
    >
      {/* Dekoratsiya (O'zgarmadi) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00B8D9]/5 to-transparent rounded-bl-full pointer-events-none" />

      {/* LAYOUT TUZATISH:
         1. flex-col lg:flex-row -> Mobileda ustma-ust, Desktopda yonma-yon.
         2. items-start lg:items-center -> Desktopda markazlashgan.
         3. justify-between ni olib tashlab, flex-1 va shrink-0 bilan boshqaramiz.
      */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-8 relative z-10">
        
        {/* 1. TITLE SECTION (Chap tomon) */}
        {/* flex-1 va min-w-0 -> Bu matnni kerak bo'lsa qisqartiradi, lekin o'ng tomonni itarib yubormaydi */}
        <div className="flex-1 min-w-0 space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#212B36] dark:text-white truncate pr-4">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground font-medium line-clamp-2 md:line-clamp-1">
              {description}
            </p>
          )}
        </div>

        {/* 2. ACTIONS SECTION (O'ng tomon) */}
        {/* - shrink-0 -> Desktopda ezilib ketmaydi.
           - w-full sm:w-auto -> Mobilda to'liq, kattada o'z o'lchami.
           - ml-auto -> Desktopda o'ngga taqaladi.
        */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-3 shrink-0 w-full sm:w-auto lg:ml-auto">
          
          {/* Search Input */}
          {searchPlaceholder && (
            // Flex-none -> Search o'lchami o'zgarmasin
            <div className="flex-none">
              <SearchInput placeholder={searchPlaceholder} />
            </div>
          )}

          {/* Action Buttons */}
          {children && (
            <div className="flex items-center gap-3 shrink-0">
              {children}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}