"use client";

import { useQuery } from "@tanstack/react-query";
import { stockHistoryService, StockHistory } from "@/lib/services/stock-history.service";
import { PageHeader } from "@/components/layout/page-header";
import { format, isToday, isYesterday } from "date-fns";
import { uz } from "date-fns/locale";
import { Loader2, ArrowUpCircle, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StockHistoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stock-history"],
    queryFn: () => stockHistoryService.getAll({ limit: 100 }), // Boshlanishiga 100 ta
  });

  const history = data?.history || [];

  // Guruhlash
  const groupedHistory = history.reduce((groups, item) => {
    const dateObj = new Date(item.createdAt);
    let dateKey = format(dateObj, "dd.MM.yyyy");
    
    if (isToday(dateObj)) {
        dateKey = "Bugun";
    } else if (isYesterday(dateObj)) {
        dateKey = "Kecha";
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(item);
    return groups;
  }, {} as Record<string, StockHistory[]>);

  const sortedDates = Object.keys(groupedHistory); // Serverdan sort bo'lib keladi, shuning uchun keys tartibi to'g'ri bo'lishi kerak (lekin bugun/kecha logic buzishi mumkin). 
  // Server desc sort qiladi. "Bugun" eng tepada bo'lishi kerak.

  return (
    <div className="space-y-6 h-full flex flex-col">
      <PageHeader
        title="Kirimlar Tarixi"
        description="Mahsulotlarning omborga kirim qilinish tarixi"
      />

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            Hozircha tarix mavjud emas
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              <div className="sticky top-0 z-10 flex items-center justify-center">
                <span className="bg-gray-100 dark:bg-white/10 text-xs font-bold px-3 py-1 rounded-full text-muted-foreground shadow-sm backdrop-blur-sm">
                  {date}
                </span>
              </div>
              
              <div className="space-y-3">
                {groupedHistory[date].map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white dark:bg-[#132326] p-4 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm flex items-start gap-4 transition-all hover:shadow-md"
                  >
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl shrink-0">
                        <ArrowUpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-bold text-[#212B36] dark:text-white text-sm md:text-base">
                                    {item.product?.name || "Noma'lum mahsulot"}
                                </h4>
                                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                                    {item.product?.barcode}
                                </p>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-sm">
                                +{Number(item.quantity)}
                            </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" />
                                <span>{item.admin?.fullName || item.admin?.username || "Admin"}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{format(new Date(item.createdAt), "HH:mm", { locale: uz })}</span>
                            </div>
                            {item.oldStock && item.newStock && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 dark:bg-white/5 rounded-md border border-gray-100 dark:border-white/5">
                                    <span>Qoldiq:</span>
                                    <span className="line-through opacity-60">{Number(item.oldStock)}</span>
                                    <span>→</span>
                                    <span className="font-bold text-[#212B36] dark:text-white">{Number(item.newStock)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}





