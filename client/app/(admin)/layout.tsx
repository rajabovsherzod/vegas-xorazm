import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsdRate } from "@/lib/api/currency";
import { adminNav } from "@/config/nav"; 

import { AppSidebar } from "@/components/layout/app-sidebar"; 
import { Header } from "@/components/layout/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, usdRate] = await Promise.all([
    getServerSession(authOptions),
    getUsdRate()
  ]);

  // Owner ham kirishi mumkin, Admin ham
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F6F8] dark:bg-[#0D1B1E]">
      {/* Desktop Sidebar */}
      <AppSidebar 
        navItems={adminNav} 
        defaultOpen={defaultOpen} 
        className="hidden md:flex border-r border-gray-200 dark:border-white/10"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <Header user={session.user} rate={usdRate} navItems={adminNav} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
            <div>
              {children}
            </div>
          </div>
        </main>

      </div>
    </div>
  )
}
