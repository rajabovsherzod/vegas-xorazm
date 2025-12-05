"use client";

import { useQuery } from "@tanstack/react-query";
import { stockHistoryService, StockHistory } from "@/lib/services/stock-history.service";
import { PageHeader } from "@/components/layout/page-header";
import { format, isToday, isYesterday } from "date-fns";
import { uz } from "date-fns/locale";
import { Loader2, ArrowUpCircle, User, Calendar, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StockHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stock-history"],
    queryFn: () => stockHistoryService.getAll({ limit: 100 }), 
  });

  const history = data?.history || [];

  // GURUHLASH LOGIKASI (Beton)
  const groupedHistory = history.reduce((groups, item) => {
    const dateObj = new Date(item.createdAt);
    
    // Sortlash oson bo'lishi uchun YYYY-MM-DD formatini kalit qilamiz
    // Lekin ko'rsatish uchun "displayLabel" ishlatamiz
    let sortKey = format(dateObj, "yyyy-MM-dd");
    let displayLabel = format(dateObj, "dd.MM.yyyy");

    if (isToday(dateObj)) {
        sortKey = "9999-99-99"; // Eng tepada turishi uchun
        displayLabel = "Bugun";
    } else if (isYesterday(dateObj)) {
        sortKey = "9999-99-98";
        displayLabel = "Kecha";
    }

    if (!groups[sortKey]) {
      groups[sortKey] = {
        label: displayLabel,
        items: []
      };
    }
    groups[sortKey].items.push(item);
    return groups;
  }, {} as Record<string, { label: string, items: StockHistory[] }>);

  // Kalitlar bo'yicha teskari sortlash (Eng yangi sana tepada)
  const sortedKeys = Object.keys(groupedHistory).sort().reverse();

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title="Kirimlar Tarixi"
        description="Omborga qilingan barcha kirimlar ro'yxati"
      />

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 pb-10 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground opacity-60">
            <PackageOpen className="w-16 h-16 mb-4 opacity-50" />
            <p>Hozircha tarix mavjud emas</p>
          </div>
        ) : (
          sortedKeys.map((key) => {
            const group = groupedHistory[key];
            return (
              <div key={key} className="space-y-4 mb-8">
                <div className="sticky top-0 z-10 flex items-center justify-center">
                  <span className="bg-gray-100/95 dark:bg-[#1C2C30]/95 text-xs font-bold px-4 py-1.5 rounded-full text-muted-foreground shadow-sm backdrop-blur-md border border-gray-200 dark:border-white/5">
                    {group.label}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white dark:bg-[#132326] p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex items-start gap-4 transition-all hover:border-emerald-500/30 hover:shadow-md group"
                    >
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
                          <ArrowUpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4">
                              <div>
                                  <h4 className="font-bold text-[#212B36] dark:text-white text-base leading-tight">
                                      {item.product?.name || "Noma'lum mahsulot"}
                                  </h4>
                                  <p className="text-xs text-muted-foreground font-mono mt-1 bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded inline-block">
                                      {item.product?.barcode}
                                  </p>
                              </div>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg text-sm whitespace-nowrap">
                                  +{Number(item.quantity)} {item.product?.unit}
                              </span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                              {/* 🔥 USER (ADDED BY) */}
                              <div className="flex items-center gap-1.5" title="Kirim qilgan xodim">
                                  <User className="w-3.5 h-3.5" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {item.addedBy?.fullName || item.addedBy?.username || "Tizim"}
                                  </span>
                                  {/* Rolini ko'rsatish (ixtiyoriy) */}
                                  {item.addedBy?.role && (
                                    <span className="text-[10px] bg-gray-100 dark:bg-white/10 px-1 rounded">
                                      {item.addedBy.role}
                                    </span>
                                  )}
                              </div>

                              <div className="flex items-center gap-1.5" title="Vaqt">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{format(new Date(item.createdAt), "HH:mm", { locale: uz })}</span>
                              </div>
                              
                              {/* Qoldiq o'zgarishi */}
                              {item.oldStock && item.newStock && (
                                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-white/5 rounded-md border border-gray-100 dark:border-white/5 ml-auto md:ml-0">
                                      <span className="opacity-70">Qoldiq:</span>
                                      <span className="line-through opacity-50">{Number(item.oldStock)}</span>
                                      <span className="text-emerald-500">→</span>
                                      <span className="font-bold text-[#212B36] dark:text-white">{Number(item.newStock)}</span>
                                  </div>
                              )}
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}