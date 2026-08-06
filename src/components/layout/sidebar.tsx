'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { useData } from '@/context/data-context';
import { CloudOff, Cloud } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, isCloudConnected } = useData();

  // İsim baş harflerini al (avatar için)
  const initials = currentUser.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden md:flex w-[260px] flex-col bg-[#111214] border-r border-[#2B2D32] h-full">
      {/* Logo Area */}
      <div className="flex h-20 shrink-0 items-center gap-3 px-6 border-b border-[#2B2D32]">
        <div className="relative w-9 h-9 shrink-0">
          <Image src="/moka-logo.png" alt="MOKA Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-black tracking-wider text-[#F7F7F8] leading-none uppercase">
            MOKA <span className="text-[#E32636]">CREATIVE</span>
          </span>
          <span className="text-[10px] text-[#73767E] font-semibold tracking-widest uppercase mt-1">
            CREATIVE AGENCY
          </span>
        </div>
        {/* Cloud bağlantı göstergesi */}
        <div className="ml-auto" title={isCloudConnected ? 'Bulut Bağlı' : 'Bağlantı Yok'}>
          {isCloudConnected
            ? <Cloud className="w-4 h-4 text-emerald-400/80" />
            : <CloudOff className="w-4 h-4 text-[#E32636]/70" />
          }
        </div>
      </div>

      <div className="px-5 pt-5 pb-2 text-[11px] font-bold text-[#73767E] tracking-widest uppercase">
        ANA MENÜ
      </div>

      {/* Nav — tüm menü öğeleri görünür */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-lg py-2.5 px-3.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#17181B] text-[#F7F7F8] red-indicator shadow-sm'
                  : 'text-[#73767E] hover:text-[#F7F7F8] hover:bg-[#24262B]'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-[#E32636]' : 'text-[#73767E]'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Alt: Aktif Kullanıcı */}
      <div className="border-t border-[#2B2D32] p-4 bg-[#111214]">
        <div className="flex items-center gap-3 rounded-lg p-2.5 bg-[#17181B] border border-[#2B2D32]">
          {/* Avatar */}
          <div className="relative w-8 h-8 shrink-0 rounded-full bg-[#24262B] border border-[#E32636]/40 flex items-center justify-center text-[#E32636] font-extrabold text-xs">
            {initials}
          </div>
          <div className="flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="truncate text-xs font-bold text-[#F7F7F8] leading-tight">{currentUser.name}</span>
            <span className="truncate text-[10px] text-[#73767E]">Yönetici</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
