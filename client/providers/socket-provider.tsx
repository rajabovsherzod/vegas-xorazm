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

      // Adminlar xonasiga qo'shilish
      if (["admin", "owner", "cashier"].includes(session.user.role)) {
        socket.emit("join_admin");
      }
      // 🔥 YANGI: Sellerlar ham o'z xonasiga kirsin (kelajak uchun kerak bo'ladi)
      if (session.user.role === "seller") {
        socket.emit("join_seller"); 
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket uzildi");
      isConnectedRef.current = false;
    });

    // ---------------- EVENTLAR ----------------

    // 1. YANGI ORDER (Faqat Admin/Cashier uchun muhim, lekin Seller ham ko'rsa zarar qilmaydi)
    socket.on("new_order", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      if (session.user.role !== "seller") {
        toast.success(`Yangi buyurtma #${data.id}`, {
          description: `${data.customerName || "Mijoz"} - ${new Intl.NumberFormat("uz-UZ").format(Number(data.totalAmount))} UZS`,
        });
      }
    });

    // 2. 🔥 ORDER TAHRIRLANDI (EDIT) - ENG MUHIM QISM
    // Bu event Sellerga ham, Cashierga ham keladi
    socket.on("order_updated", (data: { id: number }) => {
      console.log("✏️ Order tahrirlandi:", data);
      
      // Hamma joyni yangilaymiz
      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Ro'yxat
      queryClient.invalidateQueries({ queryKey: ["order", Number(data.id)] }); // Detail page (Edit page)
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });

      // Faqat boshqalar o'zgartirsa Toast chiqaramiz (o'zimizga o'zimiz chiqarmaslik uchun)
      // Lekin hozircha hammani xabardor qilamiz:
      toast.info(`Buyurtma #${data.id} ma'lumotlari yangilandi`);
    });

    // 3. ORDER STATUS O'ZGARDI
    socket.on("order_status_change", (data: { id: number; status: string }) => {
      console.log("✅ Status o'zgardi:", data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", Number(data.id)] }); 
      
      if (data.status === "completed") toast.success(`Buyurtma #${data.id} tasdiqlandi`);
      if (data.status === "cancelled") toast.error(`Buyurtma #${data.id} bekor qilindi`);
    });

    // 4. OMBOR YANGILANDI
    socket.on("stock_update", () => {
      queryClient.invalidateQueries({ queryKey: ["products"] }); 
    });

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