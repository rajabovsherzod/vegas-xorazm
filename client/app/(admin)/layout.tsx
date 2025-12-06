import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUsdRate } from "@/lib/api/currency";
import { adminNav } from "@/config/nav"; // 🔥 Admin menusi

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UsdRateProvider } from "@/providers/usd-rate-provider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [session, usdRate] = await Promise.all([
    getServerSession(authOptions),
    getUsdRate()
  ]);

  // 🔥 FAQAT ADMIN KIRISHI MUMKIN (Yoki Owner ham kirib ko'rsa bo'ladi nazorat uchun)
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'owner')) {
    redirect("/auth/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  // Fallback agar USD rate null bo'lsa
  const safeUsdRate = usdRate || "12800";

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--workspace))]">
      {/* Desktop Sidebar */}
      <AppSidebar
        // 🔥 Admin navigatsiyasini beramiz
        navItems={adminNav}
        defaultOpen={defaultOpen}
        className="hidden md:flex border-r border-white/10"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300">

        <Header user={session.user} rate={safeUsdRate} navItems={adminNav} />

        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 flex-1">
            <UsdRateProvider rate={safeUsdRate}>
              {children}
            </UsdRateProvider>
          </div>

          {/* Footer */}
          <Footer />
        </main>

      </div>
    </div>
  )
}