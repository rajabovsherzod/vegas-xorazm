"use client";

import { cn } from "@/lib/utils"; 
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface KPICardProps {
  title: string;
  value: number;
  format?: "currency" | "number" | "percent";
  icon: React.ReactNode; 
  description?: string;
  loading?: boolean;
  className?: string;
  trend?: { 
    value: number;
    isPositive?: boolean;
  };
}

export function KPICard({
  title,
  value,
  format = "number",
  icon,
  description,
  loading = false,
  className,
  trend,
}: KPICardProps) {

  // Loading holati
  if (loading) {
    return (
      <div className={cn("h-[130px] rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-5 shadow-sm", className)}>
        <div className="space-y-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    );
  }

  // Raqamni formatlash (UZS so'zisiz, faqat raqam)
  const formattedNumber = new Intl.NumberFormat("uz-UZ").format(value);

  // Trend (O'sish/Kamayish)
  const TrendIcon = trend?.isPositive ? TrendingUp : (trend?.value === 0 ? Minus : TrendingDown);
  const trendColor = trend?.isPositive 
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" 
    : "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10";

  return (
    <div
      className={cn(
        "group relative overflow-hidden", // Ikonkani kesish uchun shart
        "bg-white dark:bg-[#132326]",
        "border border-gray-200 dark:border-white/5",
        "rounded-2xl", // Tizim standarti (rounded-[2rem] emas)
        "p-5 sm:p-6",  // Mobilda kichikroq padding
        "shadow-sm hover:shadow-md transition-all duration-300",
        "hover:border-[#00B8D9]/40", // Hover bo'lganda border Feruz rangga kiradi
        className
      )}
    >
      {/* --- 1. WATERMARK ICON (Div borderlari yo'q qilindi) --- */}
      {/* Absolute joylashuv: Burchakka taqalgan */}
      <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:-rotate-12 pointer-events-none select-none">
         {/* Faqat rang va shaffoflik berilgan. 
            Hech qanday background, shadow yoki border yo'q.
            Faqat SVG ning o'zi ko'rinadi.
         */}
         <div className="text-[#00B8D9] opacity-[0.08] group-hover:opacity-[0.12] transition-opacity duration-300">
           {/* SVG hajmi: Responsive */}
           <div className="w-24 h-24 sm:w-28 sm:h-28 [&>svg]:w-full [&>svg]:h-full">
             {icon}
           </div>
         </div>
      </div>

      {/* --- 2. CONTENT (Matnlar) --- */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
        
        {/* Title */}
        <div>
          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground/80 uppercase tracking-widest">
            {title}
          </span>
        </div>

        {/* Value Section (Responsiv Text + Unit) */}
        <div className="flex items-baseline gap-1.5 sm:gap-2">
          {/* Asosiy Raqam (Katta, lekin responsive) */}
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#212B36] dark:text-white tracking-tight leading-none truncate">
            {formattedNumber}
          </h3>
          
          {/* Unit (UZS yoki dona) - Kichikroq va chiroyli */}
          <span className="text-xs sm:text-sm font-semibold text-muted-foreground/70 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-[4px] mb-0.5">
            {format === "currency" ? "UZS" : "dona"}
          </span>
        </div>

        {/* Footer: Trend va Description */}
        <div className="flex items-center gap-2 h-5 min-w-0">
          {trend ? (
            <div className={cn("flex items-center gap-1 text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0", trendColor)}>
              <TrendIcon className="w-3 h-3" />
              <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
            </div>
          ) : (
            // Layout sakramasligi uchun bo'sh joy
            <div className="h-5" /> 
          )}
          
          {/* Description (Agar joy yetmasa ... bo'lib qisqaradi) */}
          {description && (
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground/60 truncate">
              {description}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}