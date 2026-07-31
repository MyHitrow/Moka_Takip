'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { useData } from '@/context/data-context';
import { LogOut, CloudOff, Cloud } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, isCloudConnected, logout } = useData();

  // İsim baş harflerini al (avatar için)
  const initials = currentUser.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-[280px] flex-col bg-sidebar border-r border-border/80 h-full">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 px-6 border-b border-border/50">
        <div className="relative w-10 h-10 shrink-0">
          <Image src="/moka-logo.png" alt="MOKA Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-foreground leading-none">
            MOKA <span className="text-primary font-bold">TAKİP</span>
          </span>
          <span className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase mt-1">
            Creative Studio
          </span>
        </div>
        {/* Cloud bağlantı göstergesi */}
        <div className="ml-auto" title={isCloudConnected ? 'Bulut Bağlı' : 'Bağlantı Yok'}>
          {isCloudConnected
            ? <Cloud className="w-4 h-4 text-emerald-500/70" />
            : <CloudOff className="w-4 h-4 text-red-500/60" />
          }
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-lg py-2.5 px-3 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-primary/15 text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-primary" />
              )}
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Alt: Aktif Kullanıcı */}
      <div className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 rounded-xl p-3 group hover:bg-muted/40 transition-colors duration-150">
          {/* Avatar */}
          <div className="relative w-9 h-9 shrink-0 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-extrabold text-sm">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="truncate text-sm font-bold text-foreground leading-tight">{currentUser.name}</span>
            <span className="truncate text-xs text-muted-foreground">@{currentUser.username}</span>
          </div>
          {/* Çıkış Butonu */}
          <button
            onClick={logout}
            title="Çıkış Yap"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
