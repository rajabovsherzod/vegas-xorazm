"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "@/lib/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => authService.getMe(),
  });

  return (
    <div className="space-y-8">
      {/* STATISTIKA KARTALARI */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="rounded-[20px] shadow-sm border-0 bg-white dark:bg-[#132326]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-[#637381]">Umumiy Savdo</CardTitle>
            <DollarSign className="h-4 w-4 text-[#00B8D9]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#212B36] dark:text-white">$45,231.89</div>
            <p className="text-xs font-medium text-[#22C55E] mt-1">+20.1% o'tgan oyga nisbatan</p>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] shadow-sm border-0 bg-white dark:bg-[#132326]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-[#637381]">Buyurtmalar</CardTitle>
            <ShoppingBag className="h-4 w-4 text-[#8E33FF]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-[#212B36] dark:text-white">+2350</div>
            <p className="text-xs font-medium text-[#22C55E] mt-1">+180.1% o'tgan oyga nisbatan</p>
          </CardContent>
        </Card>

        {/* ... Boshqa kartalar ... */}
      </div>

      {/* ASOSIY CONTENT */}
      <div className="bg-white dark:bg-[#132326] rounded-[24px] p-8 shadow-sm min-h-[400px]">
        <h2 className="text-xl font-bold text-[#212B36] dark:text-white mb-4">Oxirgi Savdolar</h2>
        <div className="text-gray-500 text-sm">Hozircha ma'lumot yuklanmoqda...</div>
      </div>
    </div>
  );
}