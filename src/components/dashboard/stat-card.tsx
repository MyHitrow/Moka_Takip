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

export function StatCard({ title, value, icon: Icon, href, trend }: StatCardProps) {
  return (
    <Link href={href} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E32636] rounded-xl">
      <div className="bg-[#17181B] border border-[#2B2D32] rounded-xl p-4 md:p-5 hover:border-[#34363C] transition-all duration-150 panel-shadow h-full flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-1.5 rounded-md bg-[#E32636]/10 text-[#E32636] flex items-center justify-center w-7 h-7 shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs font-semibold text-[#73767E] truncate">{title}</p>
        </div>
        
        <div className="mt-1">
          <h3 className="text-xl md:text-2xl font-extrabold text-[#F7F7F8] tracking-tight">{value}</h3>
          
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#2B2D32]/50">
            {trend ? (
              <div className="flex items-center gap-1">
                {trend.value >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#E32636]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 text-[#73767E]" />
                )}
                <span className="text-[11px] font-bold text-[#E32636]">
                  %{trend.value}
                </span>
                <span className="text-[11px] text-[#73767E] ml-1">{trend.label}</span>
              </div>
            ) : (
              <span className="text-[11px] text-[#73767E]">Ajans Özeti</span>
            )}
            
            {/* Sparkline mini wave simulation */}
            <div className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 h-1.5 bg-[#E32636]/40 rounded-full" />
              <span className="w-0.5 h-2.5 bg-[#E32636]/70 rounded-full" />
              <span className="w-0.5 h-2 bg-[#E32636]/50 rounded-full" />
              <span className="w-0.5 h-3 bg-[#E32636] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
