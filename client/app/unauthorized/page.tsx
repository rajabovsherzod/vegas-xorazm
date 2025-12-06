/**
 * Unauthorized Page
 * 
 * Foydalanuvchida yetarli huquq yo'q
 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { AlertTriangle, Home, LogOut } from "lucide-react";
import Link from "next/link";

export default async function UnauthorizedPage() {
  const session = await getServerSession(authOptions);

  // Agar login qilmagan bo'lsa, login ga yuborish
  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1B1E] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-[#1C2C30] rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-[#212B36] dark:text-white mb-2">
              Ruxsat Yo'q
            </h1>
            <p className="text-muted-foreground">
              Sizda bu sahifaga kirish uchun yetarli huquq yo'q.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>Foydalanuvchi:</strong> {session.user.username}
              <br />
              <strong>Rol:</strong> {session.user.role}
            </p>

            <div className="pt-4 space-y-2">
              <Link href="/">
                <Button className="w-full bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white">
                  <Home className="w-4 h-4 mr-2" />
                  Bosh Sahifaga
                </Button>
              </Link>

              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="outline" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Chiqish
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}


