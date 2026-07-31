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
    default: "MOKA Takip — Prodüksiyon Yönetim Sistemi",
    template: "%s | MOKA Takip",
  },
  description:
    "Prodüksiyon ve sosyal medya ajansları için çekim planlama, edit yönetimi, paylaşım takvimi ve ön muhasebe yönetim paneli.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MOKA Takip",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0c14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full dark`}>
      <body className="min-h-full bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary">
        <DataProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </DataProvider>
      </body>
    </html>
  );
}
