"use client";

import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ENV } from "@/lib/config/env";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function useSocketContext() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!session?.user) return;

    // Socket ulanishini yaratish
    const socket = io(ENV.WS_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket ulandi:", socket.id);
      isConnectedRef.current = true;

      // Admin bo'lsa admin xonasiga qo'shilish
      if (session.user.role === "admin" || session.user.role === "owner") {
        socket.emit("join_admin");
        console.log("👑 Admin xonasiga qo'shildi");
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket uzildi");
      isConnectedRef.current = false;
    });

    // 🔥 YANGI ORDER (Admin uchun)
    socket.on("new_order", (data: any) => {
      console.log("📦 Yangi order keldi:", data);

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      // Muvaffaqiyatli yangi order haqida aniq xabar
      toast.success(`Yangi buyurtma #${data.id} qabul qilindi`, {
        description: `${data.customerName || "Mijoz"} - ${new Intl.NumberFormat("uz-UZ").format(Number(data.totalAmount))} UZS`,
      });
    });

    // 🔥 OMBOR YANGILANDI
    socket.on("stock_update", (data: { action: "add" | "subtract"; items: { id: number; quantity: number }[] }) => {
      // ✅ FAQQAT QUERY INVALIDATE QILINADI, ORTIQCHA TOAST YUQ
      console.log("📊 Ombor yangilanishi signali keldi");
      queryClient.invalidateQueries({ queryKey: ["products"] }); 
    });

    // 🔥 ORDER STATUS O'ZGARDI
    socket.on("order_status_change", (data: { id: number; status: string }) => {
      console.log("✅ Order status o'zgardi:", data);

      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      // Toza status xabarlari
      if (data.status === "completed") {
        toast.success(`Buyurtma #${data.id} tasdiqlandi`);
      } else if (data.status === "cancelled") {
        toast.error(`Buyurtma #${data.id} bekor qilindi`);
      }
    });

    // Cleanup
    return () => {
      socket.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [session, queryClient]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected: isConnectedRef.current }}>
      {children}
    </SocketContext.Provider>
  );
}