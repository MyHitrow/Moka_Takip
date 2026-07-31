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
    : 'MK';

  return (
    <header className="flex w-full items-center justify-between bg-sidebar/50 backdrop-blur-md md:bg-transparent py-3 px-4 md:py-6 lg:px-8 border-b md:border-b-0 border-border/40 sticky top-0 z-30">
      {/* Mobile view: Logo + Brand */}
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="relative w-8 h-8 shrink-0">
          <Image src="/moka-logo.png" alt="MOKA Logo" fill className="object-contain" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-extrabold tracking-tight text-foreground leading-none">
            MOKA <span className="text-primary font-bold">TAKİP</span>
          </span>
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
            {title}
          </span>
        </div>
      </div>

      {/* Desktop view: Page Title */}
      <div className="hidden md:flex flex-col gap-0.5">
        <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/bildirimler"
          className="relative rounded-xl p-2 text-muted-foreground hover:text-foreground hover:bg-card border border-border/50 transition-all duration-200"
          title="Bildirimler"
        >
          <Bell className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
        </Link>

        <Link
          href="/ayarlar"
          className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30 font-extrabold text-xs"
          title="Ayarlar"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}
