import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsdRate } from "@/lib/api/currency";
import { sellerNav } from "@/config/nav";

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

  // Faqat Seller
  if (!session || session.user.role !== 'seller') {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-[#F4F6F8] dark:bg-[#0D1B1E]">
      <AppSidebar navItems={sellerNav} className="hidden md:flex" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} rate={usdRate} navItems={sellerNav} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
