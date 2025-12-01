"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:5000";

interface UseSocketOptions {
  onNewOrder?: (data: any) => void;
  onStockUpdate?: (data: { action: "add" | "subtract"; items: { id: number; quantity: number }[] }) => void;
  onOrderStatusChange?: (data: { id: number; status: string }) => void;
  isAdmin?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const { onNewOrder, onStockUpdate, onOrderStatusChange, isAdmin } = options;

  useEffect(() => {
    // Socket ulanishini yaratish
    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("🔌 Socket ulandi:", socket.id);
      
      // Admin bo'lsa admin xonasiga qo'shilish
      if (isAdmin) {
        socket.emit("join_admin");
      }
    });

    // Event listenerlar
    if (onNewOrder) {
      socket.on("new_order", onNewOrder);
    }

    if (onStockUpdate) {
      socket.on("stock_update", onStockUpdate);
    }

    if (onOrderStatusChange) {
      socket.on("order_status_change", onOrderStatusChange);
    }

    socket.on("disconnect", () => {
      console.log("❌ Socket uzildi");
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [onNewOrder, onStockUpdate, onOrderStatusChange, isAdmin]);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { emit, socket: socketRef.current };
}

