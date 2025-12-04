import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsdRate } from "@/lib/api/currency";
import { sellerNav } from "@/config/nav";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UsdRateProvider } from "@/providers/usd-rate-provider";

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
    redirect("/auth/login");
  }

  // Sidebar holatini olish
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--workspace))]">
      {/* Desktop Sidebar */}
      <AppSidebar 
        navItems={sellerNav} 
        defaultOpen={defaultOpen}
        className="hidden md:flex border-r border-white/10" 
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <Header user={session.user} rate={usdRate} navItems={sellerNav} />
        
        <main className="flex-1 overflow-y-auto flex flex-col">
          {/* Umumiy markazlashgan va cheklangan kenglikdagi konteyner */}
          <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 flex-1">
            <UsdRateProvider rate={usdRate || "12800"}>
              {children}
            </UsdRateProvider>
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
