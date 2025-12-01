import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsdRate } from "@/lib/api/currency";
import { sellerNav } from "@/config/nav"; // 👈 Seller Menyu

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, usdRate] = await Promise.all([
    getServerSession(authOptions),
    getUsdRate()
  ]);

  // 🚨 XAVFSIZLIK: Faqat Seller
  if (!session || session.user.role !== 'seller') {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar navItems={sellerNav} defaultOpen={defaultOpen} /> {/* Seller Menyusi */}

      <SidebarInset className="bg-[#F4F6F8] dark:bg-[#0D1B1E] flex flex-col h-screen overflow-hidden">
        <Header user={session.user} rate={usdRate} />
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}