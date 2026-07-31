'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { Film } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-[280px] flex-col bg-sidebar border-r border-border h-full">
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-border/50">
        <div className="flex items-center justify-center rounded-xl bg-primary/20 p-2 text-primary red-glow">
          <Film className="h-5 w-5" />
        </div>
        <span className="text-lg font-extrabold tracking-tight text-foreground">
          MOKA <span className="text-primary font-bold">TAKİP</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl py-2.5 px-3.5 text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/15 text-primary font-bold border-l-4 border-primary shadow-xs' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-accent/60 cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-extrabold border border-primary/30">
            MK
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold text-foreground">Moka Medya</span>
            <span className="truncate text-xs text-muted-foreground">Süper Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
