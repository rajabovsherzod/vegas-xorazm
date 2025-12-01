"use client";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ShoppingCart, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-[#212B36] dark:text-white">Kassa & Buyurtmalar</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Bugungi Savdo" value="$3,200" icon={ShoppingCart} description="12 ta chek" />
        <StatsCard title="Kutilmoqda" value="3" icon={Clock} className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200" description="Tasdiqlash kerak" />
        <StatsCard title="Yakunlandi" value="45" icon={CheckCircle} className="bg-blue-50 dark:bg-blue-900/10 border-blue-200" />
        <StatsCard title="Kam qolgan tovar" value="8" icon={AlertTriangle} className="bg-red-50 dark:bg-red-900/10 border-red-200" description="Omborni tekshiring" />
      </div>
      {/* Bu yerda "Pending Orders" jadvali turadi */}
    </div>
  );
}