"use client";

import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/lib/services/stats.service";
import { KPICard } from "@/components/dashboard/kpi-card";
import { PageHeader } from "@/components/layout/page-header";
import { 
  TrendingUp, 
  Calendar, 
  ShoppingCart, 
  Package, 
  Users, 
  Wallet,
  Crown,
  BarChart3,
  Layers
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function OwnerDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["owner-stats"],
    queryFn: () => statsService.getOwnerStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Biznes Analytics" description="Umumiy biznes ko'rsatkichlari va statistika" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[120px] rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Grafik uchun ma'lumotlarni formatlash
  const chartData = stats?.dailySalesChart?.map((item: any) => ({
    date: format(new Date(item.date), "dd MMM", { locale: uz }),
    amount: Number(item.amount),
    count: Number(item.count)
  })) || [];

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biznes Analytics"
        description="Umumiy biznes ko'rsatkichlari va statistika"
      />

      {/* KPI Cards - 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <KPICard
          title="Bugungi Savdo"
          value={stats?.todaySales?.amount || 0}
          format="currency"
          icon={<ShoppingCart className="h-6 w-6" />}
          description={`${stats?.todaySales?.count || 0} ta buyurtma`}
          colorScheme="cyan"
        />
        <KPICard
          title="Haftalik Savdo"
          value={stats?.weeklySales?.amount || 0}
          format="currency"
          icon={<Calendar className="h-6 w-6" />}
          description={`${stats?.weeklySales?.count || 0} ta buyurtma`}
          colorScheme="blue"
        />
        <KPICard
          title="Oylik Savdo"
          value={stats?.monthlySales?.amount || 0}
          format="currency"
          icon={<TrendingUp className="h-6 w-6" />}
          description={`${stats?.monthlySales?.count || 0} ta buyurtma`}
          colorScheme="violet"
        />
        <KPICard
          title="Ombor Qiymati"
          value={stats?.inventoryValue || 0}
          format="currency"
          icon={<Wallet className="h-6 w-6" />}
          description="Jami mahsulotlar qiymati"
          colorScheme="emerald"
        />
        <KPICard
          title="Jami Buyurtmalar"
          value={stats?.totalOrders || 0}
          format="number"
          icon={<Package className="h-6 w-6" />}
          description="Yakunlangan buyurtmalar"
          colorScheme="amber"
        />
        <KPICard
          title="Xodimlar"
          value={stats?.staffCount || 0}
          format="number"
          icon={<Users className="h-6 w-6" />}
          description="Faol xodimlar soni"
          colorScheme="rose"
        />
      </div>

      {/* Charts Grid - 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kunlik Savdo Line Chart */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00B8D9]/10 rounded-lg text-[#00B8D9]">
                    <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[#212B36] dark:text-white leading-none">Kunlik Savdo</h3>
                    <p className="text-xs text-muted-foreground mt-1">Oxirgi 7 kunlik dinamika</p>
                </div>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-white/10" />
                  <XAxis 
                    dataKey="date" 
                    className="text-muted-foreground"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    stroke="currentColor"
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    tickFormatter={(value) => new Intl.NumberFormat("uz-UZ", { notation: "compact" }).format(value)}
                    stroke="currentColor"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0];
                      return (
                        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1C2C30] p-3 shadow-xl min-w-[180px]">
                          <p className="font-bold text-sm text-[#212B36] dark:text-white mb-2">
                            {data.payload.date}
                          </p>
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs text-muted-foreground">Savdo:</span>
                              <span className="text-xs font-bold text-[#00B8D9]">
                                {new Intl.NumberFormat("uz-UZ").format(Number(data.value))} so'm
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs text-muted-foreground">Cheklar:</span>
                              <span className="text-xs font-bold">
                                {data.payload.count} ta
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#00B8D9" 
                    strokeWidth={3}
                    dot={{ fill: '#00B8D9', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Ma'lumot yo'q
              </div>
            )}
          </div>
        </div>

        {/* Kategoriya bo'yicha Savdo Pie Chart */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] overflow-hidden">
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
          
          <div className="p-6 pb-4">
            {categoryChartData.length > 0 ? (
              <div className="space-y-4">
                <ChartContainer
                  config={chartConfig}
                  className="mx-auto aspect-square max-h-[280px]"
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
                      innerRadius={60}
                      outerRadius={90}
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
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
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

      {/* Top Products & Top Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Mahsulotlar */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-lg font-bold text-[#212B36] dark:text-white">Top Mahsulotlar</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              stats.topProducts.slice(0, 5).map((product: any, index: number) => (
                <div 
                  key={product.productId} 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0
                      ${index === 0 ? 'bg-amber-500 text-white' : 
                        index === 1 ? 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-white' : 
                        index === 2 ? 'bg-orange-400 text-white' : 
                        'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#212B36] dark:text-white truncate">
                        {product.productName || "Mahsulot"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(product.totalSold)} dona sotildi
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-sm text-[#00B8D9] whitespace-nowrap">
                      {new Intl.NumberFormat("uz-UZ", { notation: "compact" }).format(Number(product.revenue))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                <Package className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Sotuvchilar */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#132326] p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#00B8D9]/10 rounded-lg">
                <Users className="w-4 h-4 text-[#00B8D9]" />
              </div>
              <h3 className="text-lg font-bold text-[#212B36] dark:text-white">Top Sotuvchilar</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            {stats?.topSellers && stats.topSellers.length > 0 ? (
              stats.topSellers.slice(0, 5).map((seller: any, index: number) => (
                <div 
                  key={seller.sellerId} 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0
                      ${index === 0 ? 'bg-amber-500 text-white' : 
                        index === 1 ? 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-white' : 
                        index === 2 ? 'bg-orange-400 text-white' : 
                        'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400'}
                    `}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#212B36] dark:text-white truncate">
                        {seller.sellerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(seller.orderCount)} ta chek
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-sm text-[#00B8D9] whitespace-nowrap">
                      {new Intl.NumberFormat("uz-UZ", { notation: "compact" }).format(Number(seller.totalRevenue))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                <Users className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground">Ma'lumot yo'q</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}