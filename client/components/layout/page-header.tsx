
"use client";

import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

function SearchInput({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initial value from URL (faqat birinchi renderda)
  const initialValue = useRef(searchParams.get("search") || "");
  const [term, setTerm] = useState(initialValue.current);
  const debouncedTerm = useDebounce(term, 500);

  // Avvalgi debounced qiymatni saqlash (loop oldini olish uchun)
  const prevDebouncedTerm = useRef(debouncedTerm);

  useEffect(() => {
    // Agar qiymat o'zgarmagan bo'lsa, hech narsa qilma
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
    <div className="relative w-full sm:w-64 lg:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="pl-9 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-[#00B8D9]/20 focus:border-[#00B8D9] rounded-xl h-10 transition-all"
      />
    </div>
  );
}

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
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
      "bg-white dark:bg-[#132326] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-md",
      className
    )}>
      <div className="space-y-1 shrink-0">
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#212B36] dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground font-medium">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch sm:self-center">
        {searchPlaceholder && (
          <SearchInput placeholder={searchPlaceholder} />
        )}
        {children}
      </div>
    </div>
  );
}