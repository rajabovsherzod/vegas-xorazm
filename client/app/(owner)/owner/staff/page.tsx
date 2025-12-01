import { Suspense } from "react";
import { 
  Search, 
  User
} from "lucide-react";
import { userService } from "@/lib/services/user.service"; 
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { StaffCard } from "@/components/users/staff-card";

// UI Components
import { Input } from "@/components/ui/input";

// ----------------------------------------------------------------------
// 2. MAIN PAGE COMPONENT (SSR)
// ----------------------------------------------------------------------
export default async function UsersPage() {
  // SSR Data Fetching
  let users: any[] = [];
  try {
      // Server componentda error handling muhim
      const allUsers = await userService.getAll();
      // Owner'ni filter qilamiz - faqat admin va sellerlarni ko'rsatamiz
      users = allUsers.filter((user: any) => user.role !== 'owner');
  } catch (error) {
      console.error("Error fetching users:", error);
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827] dark:text-white">
            Xodimlar
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden md:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#00B8D9] transition-colors" />
            <Input 
              placeholder="Ism yoki ID bo'yicha qidirish..." 
              className="pl-10 w-[280px] bg-white dark:bg-[#132326] border border-gray-200 dark:border-white/10 focus:ring-4 focus:ring-[#00B8D9]/10 focus:border-[#00B8D9] rounded-xl h-11 transition-all font-medium"
            />
          </div>
          <AddUserDialog />
        </div>
      </div>

      {/* CONTENT SECTION */}
      <Suspense fallback={<UsersSkeleton />}>
          {(!users || users.length === 0) ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {users.map((user: any) => (
                <StaffCard key={user.id} user={user} />
              ))}
            </div>
          )}
      </Suspense>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. SKELETON LOADER
// ----------------------------------------------------------------------
function UsersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-[260px] w-full bg-gray-100 dark:bg-[#1C2C30] rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------
// 5. EMPTY STATE
// ----------------------------------------------------------------------
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1C2C30] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 ring-4 ring-gray-50/50 dark:ring-white/5">
        <User className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-[#111827] dark:text-white">Jamoa shakllanmagan</h3>
      <p className="text-muted-foreground text-sm max-w-xs text-center mt-1 mb-4">
        Hozircha hech qanday xodim qo'shilmagan. Ishni boshlash uchun yangi xodim qo'shing.
      </p>
      <AddUserDialog />
    </div>
  );
}
