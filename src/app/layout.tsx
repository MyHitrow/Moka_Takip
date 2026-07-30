import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DataProvider } from "@/context/data-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ajans Panel — Prodüksiyon Yönetim Sistemi",
    template: "%s | Ajans Panel",
  },
  description:
    "Prodüksiyon ve sosyal medya ajansları için çekim planlama, edit yönetimi, paylaşım takvimi ve ön muhasebe yönetim paneli.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ajans Panel",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-background text-foreground antialiased">
        <DataProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </DataProvider>
      </body>
    </html>
  );
}

