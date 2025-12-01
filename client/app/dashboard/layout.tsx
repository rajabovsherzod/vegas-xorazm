import { cookies } from "next/headers"; // Server Side Cookie
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  // Cookie "false" bo'lsa false, bo'lmasa (default) true
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";

  return (
    <div className="flex h-screen w-full bg-[#F4F6F8] dark:bg-[#0D1B1E] overflow-hidden">
      
      {/* Sidebar holatni Serverdan oladi */}
      <Sidebar defaultOpen={defaultOpen} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}