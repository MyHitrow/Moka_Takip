'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '../shared/empty-state';
import { useData } from '@/context/data-context';
import { SHOOT_STATUS_LABELS, SHOOT_STATUS_COLORS } from '@/lib/constants';

export function WeekShoots() {
  const { cekimler, formatDateTr } = useData();

  // Sort shoots by date ascending and take top upcoming ones
  const sortedShoots = [...cekimler].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card className="flex flex-col h-full bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">Yaklaşan & Bu Haftaki Çekimler</CardTitle>
        <Link href="/cekimler" className="text-xs text-[#E32636] hover:text-[#FF3545] font-semibold flex items-center gap-1 transition-colors">
          Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        {sortedShoots.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title="Çekim Bulunamadı" 
            description="Henüz eklenmiş bir çekim kaydı bulunmuyor." 
          />
        ) : (
          <div className="divide-y divide-[#2B2D32]">
            {sortedShoots.slice(0, 5).map((shoot) => (
              <div key={shoot.id} className="flex items-center justify-between p-3.5 hover:bg-[#24262B] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#F7F7F8]">{shoot.client}</span>
                    <span className="text-xs text-[#73767E] font-normal">• {shoot.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#73767E]">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#E32636]" /> {formatDateTr(shoot.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-[#73767E]" /> {shoot.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#73767E]" /> {shoot.location}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[11px] px-2.5 py-0.5 border-[#2B2D32] bg-[#1D1F23] text-[#B5B7BD] font-medium"
                >
                  {SHOOT_STATUS_LABELS[shoot.status as keyof typeof SHOOT_STATUS_LABELS] || shoot.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
