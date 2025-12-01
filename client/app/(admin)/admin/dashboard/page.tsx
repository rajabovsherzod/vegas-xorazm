"use client";

import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/lib/services/stats.service";
import { KPICard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { ShoppingCart, Clock, CheckCircle, AlertTriangle, Package, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function AdminDashboard() {
  // Client-side data fetching (Socket.io bilan real-time yangilanadi)
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => statsService.getDashboardStats(),
    // Socket.io real-time yangilanish ishlatiladi
  });

  const statusMap: Record<string, { label: string; className: string }> = {
    completed: { label: "Yakunlandi", className: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400" },
    pending: { label: "Kutilmoqda", className: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400" },
    draft: { label: "Qoralama", className: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/5 dark:text-gray-400" },
    cancelled: { label: "Bekor qilindi", className: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400" },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Bugungi savdo va buyurtmalar statistikasi" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[120px] rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Bugungi savdo va buyurtmalar statistikasi"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard
          title="Bugungi Savdo"
          value={stats?.todaySales?.amount || 0}
          format="currency"
          icon={<ShoppingCart className="h-6 w-6" />}
          description={`${stats?.todaySales?.count || 0} ta chek`}
          colorScheme="cyan"
        />
        <KPICard
          title="Kutilayotgan"
          value={stats?.pendingOrders || 0}
          format="number"
          icon={<Clock className="h-6 w-6" />}
          description="Tasdiqlash kerak"
          colorScheme="amber"
        />
        <KPICard
          title="Yakunlangan"
          value={stats?.completedOrders || 0}
          format="number"
          icon={<CheckCircle className="h-6 w-6" />}
          description="Jami buyurtmalar"
          colorScheme="emerald"
        />
        <KPICard
          title="Kam Qolgan"
          value={stats?.lowStockProducts || 0}
          format="number"
          icon={<AlertTriangle className="h-6 w-6" />}
          description="Omborni tekshiring"
          colorScheme="rose"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* So'nggi Buyurtmalar (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#212B36] dark:text-white leading-none">So'nggi Buyurtmalar</h3>
                    <p className="text-xs text-muted-foreground mt-1">Oxirgi kelib tushgan buyurtmalar ro'yxati</p>
                </div>
            </div>
            <Link href="/admin/orders">
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    Barchasi <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
            </Link>
          </div>
          
          <div className="flex-1 space-y-3">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order: any) => {
                    const status = statusMap[order.status] || { label: order.status, className: "bg-gray-100 text-gray-600 border-gray-200" };
                    return (
                        <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200">
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                <div className="h-10 w-10 rounded-full bg-white dark:bg-[#1C2C30] flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm text-muted-foreground group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#212B36] dark:text-white text-sm">
                                        #{order.id} <span className="text-muted-foreground font-normal mx-1">•</span> {order.customerName || "Mijoz"}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <User className="w-3 h-3" /> {order.seller?.fullName || "Kassir"}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {format(new Date(order.createdAt), "HH:mm")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                                <Badge 
                                    variant="outline" 
                                    className={`capitalize font-bold ${status.className}`}
                                >
                                    {status.label}
                                </Badge>
                                <p className="font-extrabold text-[#212B36] dark:text-white tabular-nums min-w-[100px] text-right">
                                    {new Intl.NumberFormat("uz-UZ").format(Number(order.finalAmount))} UZS
                                </p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center opacity-60">
                    <div className="p-4 bg-gray-100 dark:bg-white/5 rounded-full mb-3">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">Hozircha buyurtma yo'q</p>
                </div>
            )}
          </div>
        </div>

        {/* Tez Statistika (1/3 width) */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#212B36] dark:text-white">Tezkor Ko'rsatkichlar</h3>
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg">
              Real vaqt
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-100 block">Sotuv</span>
                    <span className="text-xs text-blue-600/80 dark:text-blue-400">Mahsulotlar soni</span>
                </div>
              </div>
              <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{stats?.todaySales?.count || 0}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-violet-500 text-white shadow-lg shadow-violet-500/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-sm font-bold text-violet-900 dark:text-violet-100 block">O'rtacha Chek</span>
                    <span className="text-xs text-violet-600/80 dark:text-violet-400">Bugungi savdo bo'yicha</span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400">
                {stats?.todaySales?.count && stats?.todaySales?.amount 
                  ? new Intl.NumberFormat("uz-UZ", { notation: "compact" }).format(Math.round(stats.todaySales.amount / stats.todaySales.count))
                  : 0
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
