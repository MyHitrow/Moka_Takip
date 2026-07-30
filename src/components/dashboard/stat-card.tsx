'use client';

import Link from 'next/link';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href: string;
  trend?: { value: number; label: string };
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const colorStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  danger: 'bg-red-500/10 text-red-400',
  info: 'bg-cyan-500/10 text-cyan-400',
};

export function StatCard({ title, value, icon: Icon, href, trend, color = 'default' }: StatCardProps) {
  return (
    <Link href={href} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
      <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 h-full">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-full flex items-center justify-center w-8 h-8 ${colorStyles[color]}`}>
            <Icon className="w-4 h-4" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
        
        <div className="mt-2">
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.value >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-xs font-medium ${trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
