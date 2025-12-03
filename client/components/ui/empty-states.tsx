/**
 * Empty States Components
 * 
 * Reusable empty state messages
 */

import { cn } from "@/lib/utils";
import { LucideIcon, Package, ShoppingCart, Users, FileText, AlertCircle, Search } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Base Empty State Component
 */
export function EmptyState({
  icon: Icon = AlertCircle,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      <div className="rounded-full bg-gray-100 dark:bg-white/5 p-6 mb-6">
        <Icon className="w-12 h-12 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-xl font-semibold text-[#212B36] dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * No Products Empty State
 */
export function NoProducts({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="Mahsulotlar topilmadi"
      description="Hozircha mahsulotlar mavjud emas. Yangi mahsulot qo'shish uchun quyidagi tugmani bosing."
      action={onAdd ? { label: "Mahsulot qo'shish", onClick: onAdd } : undefined}
    />
  );
}

/**
 * No Orders Empty State
 */
export function NoOrders() {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Buyurtmalar topilmadi"
      description="Hozircha buyurtmalar mavjud emas."
    />
  );
}

/**
 * No Users Empty State
 */
export function NoUsers({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="Foydalanuvchilar topilmadi"
      description="Hozircha foydalanuvchilar mavjud emas. Yangi foydalanuvchi qo'shish uchun quyidagi tugmani bosing."
      action={onAdd ? { label: "Foydalanuvchi qo'shish", onClick: onAdd } : undefined}
    />
  );
}

/**
 * No Search Results Empty State
 */
export function NoSearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Natijalar topilmadi"
      description={query ? `"${query}" bo'yicha hech narsa topilmadi. Boshqa so'z bilan qidiring.` : "Qidiruv natijalari topilmadi."}
    />
  );
}

/**
 * No Data Empty State
 */
export function NoData() {
  return (
    <EmptyState
      icon={FileText}
      title="Ma'lumotlar topilmadi"
      description="Hozircha ma'lumotlar mavjud emas."
    />
  );
}

/**
 * Empty Cart State
 */
export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Savatcha bo'sh"
      description="Mahsulot qo'shing va buyurtma yarating."
    />
  );
}

