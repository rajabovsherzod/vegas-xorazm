"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react"; // 👈 YANGI IMPORT
import { useState } from "react";
import { Toaster } from "sonner"; // Toaster shu yerda turgani ma'qul

export default function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient state
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false, 
        retry: 1,
      },
    },
  }));

  return (
    // 1. Eng tepaga SessionProvider qo'yamiz (Auth uchun)
    <SessionProvider>
      
      {/* 2. Keyin QueryClient (Data fetching uchun) */}
      <QueryClientProvider client={queryClient}>
        
        {children}
        
        <Toaster position="top-center" richColors />
      
      </QueryClientProvider>
    
    </SessionProvider>
  );
}