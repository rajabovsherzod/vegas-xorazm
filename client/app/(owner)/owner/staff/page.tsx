import { Suspense } from "react";
import { User } from "lucide-react";
import { userService } from "@/lib/services/user.service"; 
import { AddUserDialog } from "@/components/users/add-user-dialog";
import { StaffCard } from "@/components/users/staff-card";
import { PageHeader } from "@/components/layout/page-header";

// ----------------------------------------------------------------------
// MAIN PAGE COMPONENT (SSR)
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
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <PageHeader
        title="Xodimlar"
        description="Barcha xodimlar va ularning faoliyati"
        searchPlaceholder="Ism yoki ID bo'yicha qidirish..."
      >
        <AddUserDialog />
      </PageHeader>

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
