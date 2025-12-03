"use client";

import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/lib/services/stats.service";
import { KPICard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { ShoppingCart, Clock, CheckCircle, AlertTriangle, Package, User, ArrowRight, Layers, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import {
  PieChart,
  Pie
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function AdminDashboard() {
  // Client-side data fetching (Socket.io bilan real-time yangilanadi)
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => statsService.getDashboardStats(),
    // Socket.io real-time yangilanish ishlatiladi
  });

  // Ranglar har bir kategoriya uchun
  const chartColors = [
    '#00B8D9',  // Cyan
    '#10B981',  // Emerald
    '#F59E0B',  // Amber
    '#8B5CF6',  // Violet
    '#EF4444',  // Red
    '#EC4899',  // Pink
    '#6366F1',  // Indigo
    '#14B8A6',  // Teal
  ];

  // Pie chart uchun kategoriya ma'lumotlari
  const categoryChartData = stats?.categorySales?.map((item: any, index: number) => ({
    category: item.categoryName || "Kategoriyasiz",
    revenue: Number(item.totalRevenue),
    count: Number(item.orderCount),
    fill: chartColors[index % chartColors.length]
  })) || [];

  // Chart config
  const chartConfig = categoryChartData.reduce((acc: any, item: any, index: number) => {
    acc[item.category] = {
      label: item.category,
      color: chartColors[index % chartColors.length]
    };
    return acc;
  }, {
    revenue: { label: "Savdo" }
  } as ChartConfig);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* So'nggi Buyurtmalar */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 flex flex-col h-full shadow-md">
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

        {/* Kategoriya bo'yicha Savdo Pie Chart */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] overflow-hidden h-full flex flex-col shadow-md">
          <div className="p-6 pb-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#212B36] dark:text-white leading-none">Kategoriya bo'yicha</h3>
                <p className="text-xs text-muted-foreground mt-1">Savdo taqsimoti</p>
              </div>
            </div>
          </div>

          <div className="p-6 pb-4 flex-1">
            {categoryChartData.length > 0 ? (
              <div className="space-y-4 h-full flex flex-col">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[320px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        const total = categoryChartData.reduce((sum, item) => sum + item.revenue, 0);
                        const percentage = ((data.revenue / total) * 100).toFixed(1);
                        return (
                          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C2C30] p-3 shadow-xl min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: data.fill }}
                              />
                              <p className="font-bold text-sm text-[#212B36] dark:text-white">
                                {data.category}
                              </p>
                            </div>
                            <div className="space-y-1.5 pl-5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">Savdo:</span>
                                <span className="text-xs font-bold text-[#00B8D9]">
                                  {new Intl.NumberFormat("uz-UZ").format(data.revenue)} so'm
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">Ulush:</span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                  {percentage}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs text-muted-foreground">Buyurtmalar:</span>
                                <span className="text-xs font-bold">
                                  {data.count} ta
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Pie
                      data={categoryChartData}
                      dataKey="revenue"
                      nameKey="category"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={2}
                    />
                  </PieChart>
                </ChartContainer>

                {/* Legend - Kategoriyalar ro'yxati */}
                <div className="grid grid-cols-2 gap-2 px-4">
                  {categoryChartData.map((item, index) => {
                    const total = categoryChartData.reduce((sum, i) => sum + i.revenue, 0);
                    const percentage = ((item.revenue / total) * 100).toFixed(0);
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                          {item.category} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground flex items-center justify-center h-full">
                <div>
                  <Layers className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Ma'lumot yo'q</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Jami */}
          {categoryChartData.length > 0 && (
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-muted-foreground">Jami savdo:</span>
                </div>
                <span className="text-lg font-bold text-[#212B36] dark:text-white">
                  {new Intl.NumberFormat("uz-UZ").format(
                    categoryChartData.reduce((sum, item) => sum + item.revenue, 0)
                  )} so'm
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
