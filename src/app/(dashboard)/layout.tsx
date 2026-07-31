'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sidebar } from '@/components/layout/sidebar';
import { BottomNav } from '@/components/layout/bottom-nav';
import { MobileMenu } from '@/components/layout/mobile-menu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* 🦏 RHINO HEAD BACKGROUND WATERMARK WITH %40 OPACITY */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none opacity-40">
        <div
          className="absolute -top-12 -right-16 w-[650px] sm:w-[850px] lg:w-[1100px] h-[650px] sm:h-[850px] lg:h-[1100px] filter invert contrast-200"
          style={{
            backgroundImage: `url('/moka-logo.png')`,
            backgroundSize: '240%',
            backgroundPosition: '92% 3%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col h-full md:pl-[280px] relative z-10">
        {/* Generous pb-32 bottom padding on mobile so fixed bottom menu never covers content */}
        <main className="flex-1 overflow-y-auto pb-32 md:pb-8">
          {children}
        </main>
      </div>

      <BottomNav onMenuOpen={() => setIsMenuOpen(true)} />
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </div>
  );
}
