'use client';

import { useState } from 'react';
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
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full md:pl-[280px]">
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
