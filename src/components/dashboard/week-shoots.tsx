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
    <Card className="flex flex-col h-full bg-card border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-foreground">Yaklaşan & Bu Haftaki Çekimler</CardTitle>
        <Link href="/cekimler" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
          Tüm Çekimler <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="divide-y divide-border/50">
            {sortedShoots.slice(0, 5).map((shoot) => (
              <div key={shoot.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{shoot.client}</span>
                    <span className="text-xs text-muted-foreground font-normal">• {shoot.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> {formatDateTr(shoot.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-muted-foreground" /> {shoot.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground" /> {shoot.location}</span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-0.5 ${
                    SHOOT_STATUS_COLORS[shoot.status as keyof typeof SHOOT_STATUS_COLORS] || ''
                  }`}
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
