import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsdRate } from "@/lib/api/currency";
import { adminNav } from "@/config/nav"; // 👈 Admin Menyu

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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

  // 🚨 XAVFSIZLIK: Faqat Admin (va xohlasangiz Owner)
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar navItems={adminNav} /> {/* Admin Menyusi */}

      <SidebarInset className="bg-[#F4F6F8] dark:bg-[#0D1B1E] flex flex-col h-screen overflow-hidden">
        <Header user={session.user} rate={usdRate} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}