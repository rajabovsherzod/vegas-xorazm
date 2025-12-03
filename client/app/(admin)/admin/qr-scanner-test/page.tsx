"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Smartphone, Clock, QrCode as QrCodeIcon, Trash2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { uz } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import QRCodeStyling from "qr-code-styling";

interface ScanResult {
  id: string;
  token: string;
  deviceInfo: string;
  browser: string;
  timestamp: string;
}

export default function QrScannerTestPage() {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentToken, setCurrentToken] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // QR kod yaratish
  const generateQRCode = () => {
    const newToken = `CHECK-IN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setCurrentToken(newToken);

    const scanUrl = `${window.location.origin}/scan?token=${newToken}`;

    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 300,
        height: 300,
        data: scanUrl,
        image: "/white-logo.jpg",
        dotsOptions: {
          type: "extra-rounded",
          gradient: {
            type: "linear",
            rotation: 0,
            colorStops: [
              { offset: 0, color: "#00B8D9" },
              { offset: 1, color: "#005F73" },
            ],
          },
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
          imageSize: 0.4,
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: "#005F73",
        },
        cornersDotOptions: {
          type: "dot",
          color: "#005F73",
        },
      });
    } else {
      qrCodeRef.current.update({ data: scanUrl });
    }

    if (qrRef.current && qrCodeRef.current) {
      qrRef.current.innerHTML = "";
      qrCodeRef.current.append(qrRef.current);
    }
  };

  // Dastlabki QR kod
  useEffect(() => {
    generateQRCode();
    const interval = setInterval(generateQRCode, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Backend dan scan natijalarini o'qish (polling)
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const apiUrl = `http://${window.location.hostname}:5000/api/v1/qr-test/scans`;
        console.log("📥 Fetching from:", apiUrl);

        const response = await fetch(apiUrl);
        console.log("📥 Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("📦 Data received:", data);
          setScanResults(data.data || []);
        } else {
          console.error("❌ Response not OK:", response.status);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error);
      }
    };

    // Har 2 soniyada tekshirish
    const interval = setInterval(fetchScans, 2000);
    fetchScans(); // Dastlab ham tekshirish

    return () => clearInterval(interval);
  }, []);

  const clearResults = async () => {
    try {
      const apiUrl = `http://${window.location.hostname}:5000/api/v1/qr-test/scans`;
      await fetch(apiUrl, { method: "DELETE" });
      setScanResults([]);
    } catch (error) {
      console.error("❌ Clear error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="QR Davomat Testi"
        description="Telefondan scan qiling va real-time natijani ko'ring. Test rejimi - bazaga saqlanmaydi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Kod */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#212B36] dark:text-white flex items-center gap-2">
              <QrCodeIcon className="w-5 h-5 text-[#00B8D9]" />
              QR Kod
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateQRCode}
              className="text-[#00B8D9] hover:text-[#00B8D9]/90 hover:bg-[#00B8D9]/10"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Yangilash
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center bg-white p-6 rounded-2xl">
              <div ref={qrRef} />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Telefonda:</strong> Kamera bilan shu QR kodni scan qiling. Avtomatik ravishda sahifa ochiladi va ma'lumotlar o'ng tomonda paydo bo'ladi.
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">Token:</p>
              <p className="text-xs font-mono text-[#00B8D9] break-all">{currentToken}</p>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#212B36] dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#00B8D9]" />
              Scan Natijalari
              {scanResults.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({scanResults.length})
                </span>
              )}
            </h3>
            {scanResults.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearResults}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Tozalash
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {scanResults.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <QrCodeIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Hali scan qilinmagan</p>
              </div>
            ) : (
              scanResults.map((result, index) => (
                <div
                  key={result.id}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Token:</span>
                        <p className="font-mono text-sm font-bold text-[#00B8D9] break-all">
                          {result.token}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{result.deviceInfo}</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Browser: {result.browser}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {format(new Date(result.timestamp), "HH:mm:ss", { locale: uz })}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Test rejimi:</strong> Bu ma'lumotlar bazaga saqlanmaydi. Sahifani
          yangilasangiz yo'qoladi. Faqat real-time demo uchun (localStorage orqali).
        </p>
      </Card>
    </div>
  );
}

