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
