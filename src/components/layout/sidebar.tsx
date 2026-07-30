'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { Film } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-[280px] flex-col bg-[oklch(0.15_0.012_270)] border-r border-border h-full">
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-border/50">
        <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2 text-primary">
          <Film className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-primary">Ajans Panel</span>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-accent cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
            AP
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-foreground">Ajans Profili</span>
            <span className="truncate text-xs text-muted-foreground">Yönetici</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
