/**
 * Loading States Components
 * 
 * Reusable loading skeletons and spinners
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Skeleton - Base skeleton component
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200 dark:bg-white/5", className)}
      {...props}
    />
  );
}

/**
 * Spinner - Loading spinner
 */
export function Spinner({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <Loader2
      className={cn("animate-spin text-[#00B8D9]", className)}
      size={size}
    />
  );
}

/**
 * Full Page Loader
 */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Spinner size={48} />
        <p className="mt-4 text-sm text-muted-foreground">Yuklanmoqda...</p>
      </div>
    </div>
  );
}

/**
 * Card Skeleton
 */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

/**
 * Order Card Skeleton
 */
export function OrderCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>
    </div>
  );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <Skeleton className="h-6 w-1/3 mb-6" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

