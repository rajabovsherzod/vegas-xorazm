import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ENV } from "@/lib/config/env";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Socket URL - telefon uchun to'g'ridan-to'g'ri IP
    const wsUrl = typeof window !== 'undefined'
      ? `http://${window.location.hostname}:5000`
      : ENV.WS_URL;

    console.log("🔌 Socket ulanish boshlandi. URL:", wsUrl);

    // Socket ulanish
    const socketInstance = io(wsUrl, {
      transports: ["polling", "websocket"], // Polling birinchi (telefon uchun)
      reconnection: true,
      reconnectionAttempts: 10, // 5 dan 10 ga oshirildi
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // 10 dan 20 ga oshirildi
      forceNew: false,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      setIsConnected(false);
      
      // Backend server ishlamayapti deb xabar berish
      if (error.message.includes("xhr poll error") || error.message.includes("ECONNREFUSED")) {
        console.warn("⚠️ Backend server ishlamayapti. Iltimos, backend serverni ishga tushiring (port 5000)");
      }
    });

    socketInstance.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnect attempt ${attempt}`);
    });

    socketInstance.on("reconnect", (attempt) => {
      console.log(`✅ Socket reconnected after ${attempt} attempts`);
      setIsConnected(true);
    });

    socketInstance.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed. Backend serverni tekshiring.");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🔌 Socket disconnect qilinmoqda");
      socketInstance.disconnect();
      setIsConnected(false);
    };
  }, []);

  return socket;
}