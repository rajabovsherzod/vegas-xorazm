"use client";
import { StatsCard } from "@/components/dashboard/stats-card";
import { DollarSign, TrendingUp, Users, Package } from "lucide-react";

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-[#212B36] dark:text-white">Business Overview</h2>
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Sof Foyda" value="$12,450" icon={DollarSign} trend="up" trendValue="+12%" className="bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-200" />
        <StatsCard title="Umumiy Savdo" value="$45,231" icon={TrendingUp} trend="up" trendValue="+20%" />
        <StatsCard title="Xodimlar" value="12" icon={Users} trend="neutral" />
        <StatsCard title="Ombor Qiymati" value="$120,000" icon={Package} trend="down" trendValue="-5%" />
      </div>
      {/* Grafiklar va Katta jadvallar shu yerda bo'ladi */}
    </div>
  );
}