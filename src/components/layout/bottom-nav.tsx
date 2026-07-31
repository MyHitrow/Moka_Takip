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
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 pb-safe items-center justify-around bg-sidebar/95 backdrop-blur-2xl border-t border-border/80 md:hidden shadow-2xl">
      {BOTTOM_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && item.href !== '#menu' && pathname.startsWith(`${item.href}`));
        const Icon = item.icon;

        if (item.href === '#menu') {
          return (
            <button
              key={item.label}
              onClick={onMenuOpen}
              className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-bold transition-all duration-150 active:scale-95 ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="p-1 rounded-xl">
                <Icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-14 h-full text-[10px] font-bold transition-all duration-150 active:scale-95 ${
              isActive ? 'text-primary font-extrabold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary/15 text-primary' : ''}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
