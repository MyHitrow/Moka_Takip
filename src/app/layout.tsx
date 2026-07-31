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
};

export const viewport: Viewport = {
  themeColor: "#8b0000",
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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=3" />
        <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png?v=3" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png?v=3" />
        <link rel="shortcut icon" href="/apple-touch-icon.png?v=3" />
        <meta name="apple-mobile-web-app-title" content="MOKA Takip" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary">
        <DataProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </DataProvider>
      </body>
    </html>
  );
}
