import { 
  Clock, 
  Wallet,
  TrendingUp,
  MoreHorizontal,
  Shield,
  KeyRound,
  Trash2
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Helper Functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return "Administrator";
    case 'seller': return "Sotuvchi";
    default: return role;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/30";
    case 'seller': return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
};

export function StaffCard({ user }: { user: any }) {
  const isActive = user.isActive;

  return (
    <Card className="group relative overflow-hidden bg-white dark:bg-[#1C2C30] border border-gray-200 dark:border-white/5 hover:border-[#00B8D9]/30 hover:shadow-lg transition-all duration-300 rounded-xl">
      
      <div className="p-5">
          {/* HEADER */}
          <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3.5">
                  <div className="relative">
                      <Avatar className="h-14 w-14 border-2 border-white dark:border-[#1C2C30] shadow-sm">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName}&background=00B8D9&color=fff&bold=true&size=128`} />
                          <AvatarFallback className="bg-gradient-to-br from-[#00B8D9] to-[#009bb5] text-white font-bold text-lg">
                          {user.fullName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white dark:border-[#1C2C30] rounded-full",
                          isActive ? "bg-emerald-500" : "bg-red-500"
                      )} />
                  </div>
                  
                  <div>
                      <h3 className="font-bold text-[17px] text-gray-900 dark:text-white leading-tight group-hover:text-[#00B8D9] transition-colors">
                          {user.fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 h-5 border",
                            getRoleBadgeColor(user.role)
                          )}>
                            {getRoleLabel(user.role)}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">@{user.username}</span>
                      </div>
                  </div>
              </div>

              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 rounded-lg -mr-2">
                          <MoreHorizontal className="h-5 w-5" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl bg-white dark:bg-[#1C2C30] border-gray-200 dark:border-white/10 shadow-xl z-[9999]">
                      <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/5">
                          <Shield className="w-4 h-4 mr-2 text-gray-500" />
                          Batafsil
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/5">
                          <Shield className="w-4 h-4 mr-2 text-gray-500" />
                          Tahrirlash
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                          <KeyRound className="w-4 h-4 mr-2 text-gray-500" />
                          Parolni tiklash
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className={cn("cursor-pointer", isActive ? "text-red-500 focus:text-red-600 focus:bg-red-50" : "text-green-500 focus:text-green-600 focus:bg-green-50")}>
                          {isActive ? (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Bloklash
                              </>
                          ) : (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Faollashtirish
                              </>
                          )}
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>

          {/* INFO GRID */}
          <div className="grid grid-cols-2 gap-3">
              {/* Salary Card */}
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center justify-between group/salary hover:border-[#00B8D9]/20 transition-colors">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-white/5 rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                          <Wallet className="w-4 h-4 text-[#00B8D9]" />
                      </div>
                      <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Oylik Maosh</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white font-mono">
                              {formatCurrency(Number(user.fixSalary))}
                          </p>
                      </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-mono font-bold border-0">
                      +{user.bonusPercent}%
                  </Badge>
              </div>

              {/* Work Time */}
              <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <div className="p-1.5 bg-gray-50 dark:bg-white/10 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                      <p className="text-[10px] font-medium text-muted-foreground">Ish vaqti</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 font-mono">{user.workStartTime}</p>
                  </div>
              </div>

              {/* KPI / Stats Placeholder (Kelajakda real data qo'shish uchun) */}
              <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <div className="p-1.5 bg-gray-50 dark:bg-white/10 rounded-md">
                      <TrendingUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div>
                      <p className="text-[10px] font-medium text-muted-foreground">KPI</p>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 font-mono">0.0%</p>
                  </div>
              </div>
          </div>
      </div>
    </Card>
  );
}
