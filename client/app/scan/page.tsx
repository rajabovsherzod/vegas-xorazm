"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

function ScanPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [sent, setSent] = useState(false);

  const handleConfirm = async () => {
    if (!token || sent) return;

    try {
      const deviceInfo = getDeviceInfo();
      const apiUrl = `http://${window.location.hostname}:5000/api/v1/qr-test/scan`;

      console.log("📤 Yuborilmoqda:", apiUrl);
      console.log("📦 Data:", { token, deviceInfo: deviceInfo.device, browser: deviceInfo.browser });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          deviceInfo: deviceInfo.device,
          browser: deviceInfo.browser,
        }),
      });

      console.log("📥 Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Response data:", data);
        setSent(true);
      } else {
        const errorText = await response.text();
        console.error("❌ Error response:", errorText);
        alert(`Xatolik: ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Network error:", error);
      alert(`Tarmoq xatosi: ${error}`);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0D1B1E] flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <p className="text-red-500">Token topilmadi!</p>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00B8D9]/10 via-white to-[#00B8D9]/5 dark:from-[#0D1B1E] dark:via-[#0D1B1E] dark:to-[#0D1B1E] flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#212B36] dark:text-white mb-2">
              ✅ Muvaffaqiyatli!
            </h1>
            <p className="text-muted-foreground text-lg">
              Davomat belgilandi
            </p>
          </div>

          <div className="bg-[#00B8D9]/10 dark:bg-[#00B8D9]/20 p-4 rounded-xl">
            <p className="text-sm text-[#212B36] dark:text-white">
              Sizning kelganingiz qayd qilindi. Rahmat!
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            Bu sahifani yopishingiz mumkin
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00B8D9]/10 via-white to-[#00B8D9]/5 dark:from-[#0D1B1E] dark:via-[#0D1B1E] dark:to-[#0D1B1E] flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#00B8D9]/10 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-[#00B8D9]" />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#212B36] dark:text-white mb-2">
            Davomat Tasdiqlash
          </h1>
          <p className="text-muted-foreground">
            Kelganingizni tasdiqlash uchun tugmani bosing
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl text-left space-y-2">
          <div className="text-xs text-muted-foreground">Token:</div>
          <div className="text-xs font-mono text-[#00B8D9] break-all">{token}</div>

          <div className="text-xs text-muted-foreground mt-3">Qurilma:</div>
          <div className="text-xs">{getDeviceInfo().device}</div>

          <div className="text-xs text-muted-foreground mt-2">Browser:</div>
          <div className="text-xs">{getDeviceInfo().browser}</div>
        </div>

        <Button
          onClick={handleConfirm}
          className="w-full h-12 bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white text-lg"
          size="lg"
        >
          Davomat Tasdiqlash
        </Button>

        <p className="text-xs text-muted-foreground">
          Konsolni oching (F12) va xatolarni ko'ring
        </p>
      </Card>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00B8D9]"></div>
      </div>
    }>
      <ScanPageContent />
    </Suspense>
  );
}

// Device info olish
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = "Desktop";
  let browser = "Unknown";

  // Device
  if (/mobile/i.test(ua)) {
    device = "Mobile";
  } else if (/tablet|ipad/i.test(ua)) {
    device = "Tablet";
  }

  // OS
  if (/android/i.test(ua)) {
    device += " (Android)";
  } else if (/iphone|ipad/i.test(ua)) {
    device += " (iOS)";
  } else if (/windows/i.test(ua)) {
    device += " (Windows)";
  } else if (/mac/i.test(ua)) {
    device += " (Mac)";
  }

  // Browser
  if (ua.indexOf("Chrome") > -1) {
    browser = "Chrome";
  } else if (ua.indexOf("Safari") > -1) {
    browser = "Safari";
  } else if (ua.indexOf("Firefox") > -1) {
    browser = "Firefox";
  } else if (ua.indexOf("Edge") > -1) {
    browser = "Edge";
  }

  return { device, browser };
}


