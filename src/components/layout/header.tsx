'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between bg-transparent py-6 px-4 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground hidden md:block">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 md:hidden">
        <Link 
          href="/bildirimler" 
          className="relative rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200"
        >
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background"></span>
        </Link>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
          AP
        </div>
      </div>
    </header>
  );
}
