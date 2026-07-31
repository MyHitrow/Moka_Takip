'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileMenu } from '@/components/layout/mobile-menu';
import { PwaInstallPrompt } from '@/components/shared/pwa-install-prompt';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative min-w-0">
      {/* BACKGROUND WATERMARK LOGO */}
      <div className="fixed top-0 bottom-0 left-0 md:left-[280px] right-0 pointer-events-none z-0 overflow-hidden select-none opacity-40">
        <div
          className="absolute -top-8 left-0 w-[550px] sm:w-[750px] lg:w-[900px] h-[550px] sm:h-[750px] lg:h-[900px] filter invert contrast-200"
          style={{
            backgroundImage: `url('/moka-logo.png')`,
            backgroundSize: '210%',
            backgroundPosition: '0% 0%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-full min-w-0 md:pl-[280px] relative z-10">
        <main className="flex-1 overflow-y-auto min-w-0 pb-[max(7rem,calc(5rem+env(safe-area-inset-bottom)))] md:pb-8">
          {children}
        </main>
      </div>

      <BottomNav onMenuOpen={() => setIsMenuOpen(true)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <PwaInstallPrompt />
    </div>
  );
}
