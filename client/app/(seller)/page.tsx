"use client";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Wallet, Star, Trophy, History } from "lucide-react";

export default function SellerDashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-extrabold text-[#212B36] dark:text-white">Mening Natijalarim</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard title="Bugungi Savdoim" value="$850" icon={Wallet} trend="up" trendValue="Zo'r!" />
        <StatsCard title="Mening Bonusim" value="$12.5" icon={Star} className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200" description="Joriy oy uchun" />
        <StatsCard title="Reyting" value="#2" icon={Trophy} description="Ali sizdan oldinda" />
      </div>
      
      {/* Bu yerda "Sotish (POS)" ga o'tish uchun katta tugma bo'lishi mumkin */}
      <div className="p-8 bg-white dark:bg-[#132326] rounded-2xl shadow-sm border border-border text-center">
        <h3 className="text-lg font-bold mb-4">Yangi savdo boshlaysizmi?</h3>
        <a href="/seller/pos" className="inline-flex h-12 items-center justify-center rounded-xl bg-[#00B8D9] px-8 text-sm font-bold text-white shadow-lg transition-colors hover:bg-[#006C9C]">
          Kassaga o'tish (POS)
        </a>
      </div>
    </div>
  );
}