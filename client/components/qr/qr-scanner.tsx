"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (data: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Orqa kamera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Scan muvaffaqiyatli
          setLastScan(decodedText);
          onScan(decodedText);

          // 1 soniya kutib, yana scan qilish imkonini berish
          setTimeout(() => setLastScan(null), 1000);
        },
        (errorMessage) => {
          // Scan xatolik (har doim chiqadi, e'tibor bermaslik kerak)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Scanner xatosi:", err);
      setError(err.message || "Kamera ochilmadi");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setError(null);
    } catch (err) {
      console.error("Scanner to'xtatish xatosi:", err);
    }
  };

  useEffect(() => {
    return () => {
      // Component unmount bo'lganda scanner ni to'xtatish
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Scanner ekrani */}
      <div className="relative">
        <div
          id="qr-reader"
          className="rounded-2xl overflow-hidden border-4 border-[#00B8D9] shadow-lg"
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto"
          }}
        />

        {/* Scan indicator */}
        {lastScan && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Scan qilindi!</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="w-full max-w-xs bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white h-12"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Scannerni Boshlash
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="w-full max-w-xs h-12"
            size="lg"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            To'xtatish
          </Button>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg max-w-xs">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          QR kodni kamera oldiga qo'ying. Avtomatik scan qilinadi.
        </p>
      </div>
    </div>
  );
}






import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (data: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Orqa kamera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Scan muvaffaqiyatli
          setLastScan(decodedText);
          onScan(decodedText);

          // 1 soniya kutib, yana scan qilish imkonini berish
          setTimeout(() => setLastScan(null), 1000);
        },
        (errorMessage) => {
          // Scan xatolik (har doim chiqadi, e'tibor bermaslik kerak)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Scanner xatosi:", err);
      setError(err.message || "Kamera ochilmadi");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setError(null);
    } catch (err) {
      console.error("Scanner to'xtatish xatosi:", err);
    }
  };

  useEffect(() => {
    return () => {
      // Component unmount bo'lganda scanner ni to'xtatish
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Scanner ekrani */}
      <div className="relative">
        <div
          id="qr-reader"
          className="rounded-2xl overflow-hidden border-4 border-[#00B8D9] shadow-lg"
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto"
          }}
        />

        {/* Scan indicator */}
        {lastScan && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Scan qilindi!</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="w-full max-w-xs bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white h-12"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Scannerni Boshlash
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="w-full max-w-xs h-12"
            size="lg"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            To'xtatish
          </Button>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg max-w-xs">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          QR kodni kamera oldiga qo'ying. Avtomatik scan qilinadi.
        </p>
      </div>
    </div>
  );
}







import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (data: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Orqa kamera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Scan muvaffaqiyatli
          setLastScan(decodedText);
          onScan(decodedText);

          // 1 soniya kutib, yana scan qilish imkonini berish
          setTimeout(() => setLastScan(null), 1000);
        },
        (errorMessage) => {
          // Scan xatolik (har doim chiqadi, e'tibor bermaslik kerak)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Scanner xatosi:", err);
      setError(err.message || "Kamera ochilmadi");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setError(null);
    } catch (err) {
      console.error("Scanner to'xtatish xatosi:", err);
    }
  };

  useEffect(() => {
    return () => {
      // Component unmount bo'lganda scanner ni to'xtatish
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Scanner ekrani */}
      <div className="relative">
        <div
          id="qr-reader"
          className="rounded-2xl overflow-hidden border-4 border-[#00B8D9] shadow-lg"
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto"
          }}
        />

        {/* Scan indicator */}
        {lastScan && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Scan qilindi!</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="w-full max-w-xs bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white h-12"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Scannerni Boshlash
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="w-full max-w-xs h-12"
            size="lg"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            To'xtatish
          </Button>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg max-w-xs">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          QR kodni kamera oldiga qo'ying. Avtomatik scan qilinadi.
        </p>
      </div>
    </div>
  );
}






import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrScannerProps {
  onScan: (data: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Orqa kamera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Scan muvaffaqiyatli
          setLastScan(decodedText);
          onScan(decodedText);

          // 1 soniya kutib, yana scan qilish imkonini berish
          setTimeout(() => setLastScan(null), 1000);
        },
        (errorMessage) => {
          // Scan xatolik (har doim chiqadi, e'tibor bermaslik kerak)
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error("Scanner xatosi:", err);
      setError(err.message || "Kamera ochilmadi");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      }
      setIsScanning(false);
      setError(null);
    } catch (err) {
      console.error("Scanner to'xtatish xatosi:", err);
    }
  };

  useEffect(() => {
    return () => {
      // Component unmount bo'lganda scanner ni to'xtatish
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Scanner ekrani */}
      <div className="relative">
        <div
          id="qr-reader"
          className="rounded-2xl overflow-hidden border-4 border-[#00B8D9] shadow-lg"
          style={{
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto"
          }}
        />

        {/* Scan indicator */}
        {lastScan && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-300">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Scan qilindi!</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            className="w-full max-w-xs bg-[#00B8D9] hover:bg-[#00B8D9]/90 text-white h-12"
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Scannerni Boshlash
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="w-full max-w-xs h-12"
            size="lg"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            To'xtatish
          </Button>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg max-w-xs">
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center max-w-xs">
          QR kodni kamera oldiga qo'ying. Avtomatik scan qilinadi.
        </p>
      </div>
    </div>
  );
}







