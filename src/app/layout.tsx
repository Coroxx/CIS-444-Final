import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { ChatSidebar } from "@/components/layout/ChatSidebar";
import { AuthProvider } from "@/components/layout/AuthProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "StockScope — Track Stocks, Crypto & Simulated Trading",
  description:
    "Search stocks and crypto, view interactive charts, and trade with simulated currency. Built by Market Vision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <AuthProvider>
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto">{children}</main>
            <ChatSidebar />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "oklch(0.17 0.02 264)",
                border: "1px solid oklch(0.28 0.02 264)",
                color: "oklch(0.93 0.005 264)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
