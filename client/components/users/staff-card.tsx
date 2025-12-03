import {
  User,
  MoreHorizontal,
  Eye,
  Shield,
  KeyRound,
  Trash2
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Helper Functions
const getRoleLabel = (role: string) => {
  switch (role) {
    case 'admin': return "Administrator";
    case 'seller': return "Sotuvchi";
    default: return role;
  }
};

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'admin': return "bg-[#00B8D9]/10 text-[#00B8D9] border-[#00B8D9]/20 dark:bg-[#00B8D9]/20";
    case 'seller': return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30";
    default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  }
};

export function StaffCard({ user }: { user: any }) {
  const isActive = user.isActive;

  return (
    <div className="group relative bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#00B8D9]/30 hover:bg-white dark:hover:bg-[#132326] transition-all duration-200 rounded-xl p-3">

      <div className="flex items-center justify-between gap-3">
        {/* LEFT: Icon + Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative shrink-0">
            <div className="h-9 w-9 rounded-lg bg-[#00B8D9]/10 dark:bg-[#00B8D9]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#00B8D9]" />
            </div>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2 h-2 border-2 border-gray-50 dark:border-[#132326] rounded-full",
              isActive ? "bg-emerald-500" : "bg-rose-500"
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-[#212B36] dark:text-white truncate mb-0.5">
              {user.fullName}
            </h3>
            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
          </div>
        </div>

        {/* CENTER: Role Badge */}
        <Badge variant="outline" className={cn(
          "text-xs font-bold px-2.5 py-1 border shrink-0",
          getRoleBadgeColor(user.role)
        )}>
          {getRoleLabel(user.role)}
        </Badge>

        {/* RIGHT: Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#00B8D9] hover:bg-[#00B8D9]/10 rounded-lg shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl bg-white dark:bg-[#1C2C30] border-gray-200 dark:border-white/10 shadow-xl z-[9999]">
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/5 text-xs">
              <Eye className="w-3.5 h-3.5 mr-2 text-gray-500" />
              Batafsil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/5 text-xs">
              <Shield className="w-3.5 h-3.5 mr-2 text-gray-500" />
              Tahrirlash
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer focus:bg-gray-100 dark:focus:bg-white/5 text-xs">
              <KeyRound className="w-3.5 h-3.5 mr-2 text-gray-500" />
              Parolni tiklash
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={cn("cursor-pointer text-xs", isActive ? "text-rose-500 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20" : "text-emerald-500 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-900/20")}>
              {isActive ? (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Bloklash
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 mr-2" />
                  Faollashtirish
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
