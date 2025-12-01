"use client";

import { cn } from "@/lib/utils";

export interface KPICardProps {
  title: string;
  value: number;
  format?: "currency" | "number" | "percent";
  icon: React.ReactNode;
  description?: string;
  colorScheme?: "cyan" | "emerald" | "amber" | "rose" | "violet" | "blue";
  loading?: boolean;
  className?: string;
}

const colorSchemes = {
  cyan: {
    border: "group-hover:border-cyan-500/50",
    iconBg: "bg-cyan-50 dark:bg-cyan-950/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  emerald: {
    border: "group-hover:border-emerald-500/50",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    border: "group-hover:border-amber-500/50",
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    border: "group-hover:border-rose-500/50",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  violet: {
    border: "group-hover:border-violet-500/50",
    iconBg: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  blue: {
    border: "group-hover:border-blue-500/50",
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
};

export function KPICard({
  title,
  value,
  format = "number",
  icon,
  description,
  colorScheme = "cyan",
  loading = false,
  className,
}: KPICardProps) {
  const colors = colorSchemes[colorScheme];

  if (loading) {
    return (
      <div className={cn("h-[120px] rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 animate-pulse", className)}>
        <div className="flex justify-between items-start">
          <div className="space-y-3">
             <div className="h-4 w-24 bg-gray-200 dark:bg-white/5 rounded" />
             <div className="h-8 w-32 bg-gray-200 dark:bg-white/5 rounded" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-white/5" />
        </div>
      </div>
    );
  }

  const formattedValue = new Intl.NumberFormat("uz-UZ").format(value);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 transition-colors duration-300",
        colors.border,
        className
      )}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col justify-between h-full space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1.5">
                <h3 className="text-3xl font-bold text-[#212B36] dark:text-white tracking-tight">
                    {formattedValue}
                </h3>
                {format === "currency" && (
                    <span className="text-sm font-semibold text-muted-foreground">UZS</span>
                )}
            </div>
            {description && (
              <p className="text-xs font-medium text-muted-foreground/80 pt-1">{description}</p>
            )}
        </div>
        
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl transition-colors duration-300", 
          colors.iconBg, 
          colors.iconColor
        )}>
            {icon}
        </div>
      </div>
    </div>
  );
}
