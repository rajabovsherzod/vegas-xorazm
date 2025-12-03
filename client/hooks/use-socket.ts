import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ENV } from "@/lib/config/env";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

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
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connect error:", error.message);
    });

    socketInstance.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnect attempt ${attempt}`);
    });

    setSocket(socketInstance);

    return () => {
      console.log("🔌 Socket disconnect qilinmoqda");
      socketInstance.disconnect();
    };
  }, []);

  return socket;
}
