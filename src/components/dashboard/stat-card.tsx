'use client';

import Link from 'next/link';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  href: string;
  trend?: { value: number; label: string };
}

export function StatCard({ title, value, icon: Icon, href, trend }: StatCardProps) {
  return (
    <Link href={href} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E32636] rounded-xl">
      <div className="bg-[#17181B] border border-[#2B2D32] rounded-xl p-4 hover:border-[#34363C] transition-all duration-150 panel-shadow h-full flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-md bg-[#E32636]/10 text-[#E32636] flex items-center justify-center w-6 h-6 shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] font-semibold text-[#73767E] truncate">{title}</p>
        </div>
        
        <div className="mt-1">
          <h3 className="text-xl md:text-2xl font-black text-[#F7F7F8] tracking-tight">{value}</h3>
          
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#2B2D32]/50">
            <div className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-[#E32636]" />
              <span className="text-[11px] font-bold text-[#E32636]">
                %{trend ? trend.value : '12'}
              </span>
              <span className="text-[10px] text-[#73767E] ml-0.5">{trend ? trend.label : 'bu ay'}</span>
            </div>

            {/* Red Wave Line SVG */}
            <svg className="w-10 h-3 text-[#E32636] stroke-current fill-none" viewBox="0 0 40 12" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9 L8 6 L16 8 L24 3 L32 6 L39 1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
