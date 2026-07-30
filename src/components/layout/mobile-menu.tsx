'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <div
      className={`fixed inset-0 z-50 bg-background/98 backdrop-blur-xl transition-all duration-200 md:hidden ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border/50">
        <span className="text-lg font-semibold tracking-tight text-foreground">Menü</span>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-64px)] pb-20">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-4 rounded-xl py-4 px-4 text-base transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-6 w-6" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
