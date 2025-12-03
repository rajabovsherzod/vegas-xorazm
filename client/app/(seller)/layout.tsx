import { redirect } from "next/navigation";
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

  return (
    <div className="flex h-screen bg-[hsl(var(--workspace))]">
      <AppSidebar navItems={sellerNav} className="hidden md:flex" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} rate={usdRate} navItems={sellerNav} />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="flex-1">
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
