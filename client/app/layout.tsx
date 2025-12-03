import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/query-provider";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "next-themes";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vegas CRM",
  description: "Professional Savdo Tizimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full overflow-hidden">
      <body className={`${jakarta.variable} antialiased h-full overflow-hidden`} style={{ fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <Toaster position="top-right" richColors closeButton />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
