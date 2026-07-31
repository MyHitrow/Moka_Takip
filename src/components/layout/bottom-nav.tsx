'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_ITEMS } from '@/lib/constants';

interface BottomNavProps {
  onMenuOpen: () => void;
}

export function BottomNav({ onMenuOpen }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 pb-safe items-center justify-around bg-sidebar/95 backdrop-blur-xl border-t border-border md:hidden shadow-lg">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        if (item.href === '#menu') {
          return (
            <button
              key={item.label}
              onClick={onMenuOpen}
              className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-all duration-200 ${
                isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-all duration-200 ${
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
