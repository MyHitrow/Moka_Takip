'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Bell } from 'lucide-react';
import { useData } from '@/context/data-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { currentUser } = useData();
  const initials = currentUser?.name
    ? currentUser.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : 'RL';

  return (
    <header className="sticky top-0 z-30 flex w-full items-center justify-between bg-[#0D0E10]/90 backdrop-blur-xl pt-[max(1rem,calc(env(safe-area-inset-top)+0.5rem))] pb-3 px-4 md:py-5 lg:px-8 border-b border-[#2B2D32]">
      {/* Mobile view: Logo + Brand */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="relative w-7 h-7 shrink-0">
          <Image src="/moka-logo.png" alt="REDLINE Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black tracking-wider text-[#F7F7F8] leading-none uppercase">
            REDLINE <span className="text-[#E32636]">MEDYA</span>
          </span>
          <span className="text-[9px] text-[#73767E] font-medium uppercase tracking-wider mt-0.5">
            {title}
          </span>
        </div>
      </div>

      {/* Desktop view: Page Title */}
      <div className="hidden md:flex flex-col gap-0.5">
        <h1 className="text-lg font-bold text-[#F7F7F8] tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[#73767E]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side controls & Search Bar */}
      <div className="flex items-center gap-3">
        {/* Search Bar mockup */}
        <div className="hidden lg:flex items-center gap-2 bg-[#17181B] border border-[#2B2D32] rounded-lg px-3 py-1.5 text-xs text-[#73767E] w-56">
          <span className="text-sm">🔍</span>
          <span className="flex-1 truncate">Arama yap...</span>
          <kbd className="bg-[#24262B] text-[10px] px-1.5 py-0.5 rounded text-[#B5B7BD] font-mono">⌘K</kbd>
        </div>

        <Link
          href="/bildirimler"
          className="relative rounded-lg p-2 text-[#B5B7BD] hover:text-[#F7F7F8] hover:bg-[#17181B] border border-[#2B2D32] transition-all duration-150"
          title="Bildirimler"
        >
          <Bell className="h-4 w-4 text-[#F7F7F8]" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E32636] text-[9px] font-bold text-white shadow-sm">
            5
          </span>
        </Link>

        <Link
          href="/ayarlar"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#17181B] text-[#E32636] border border-[#2B2D32] font-extrabold text-xs hover:border-[#E32636]/50 transition-colors"
          title="Ayarlar"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
