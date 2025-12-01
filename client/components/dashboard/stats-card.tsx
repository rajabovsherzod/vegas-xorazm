import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("rounded-[20px] border-0 shadow-sm transition-all hover:shadow-md bg-white dark:bg-[#132326]", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Sarlavha */}
        <CardTitle className="text-sm font-bold text-[#637381] dark:text-gray-400">
          {title}
        </CardTitle>
        
        {/* Ikonka foni bilan */}
        <div className="h-10 w-10 rounded-xl bg-[#00B8D9]/10 flex items-center justify-center text-[#00B8D9]">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Asosiy Raqam */}
        <div className="text-2xl font-extrabold text-[#212B36] dark:text-white">
          {value}
        </div>
        
        {/* O'sish/Kamayish foizi */}
        {(description || trendValue) && (
          <p className="text-xs font-medium mt-1 flex items-center gap-1">
            {trend === "up" && (
              <span className="text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                ↑ {trendValue}
              </span>
            )}
            {trend === "down" && (
              <span className="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md flex items-center">
                ↓ {trendValue}
              </span>
            )}
            <span className="text-[#637381] dark:text-gray-500 ml-1">{description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}