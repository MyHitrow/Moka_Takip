import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { EmptyState } from '../shared/empty-state';

// Using constants for mock data as requested
const MOCK_SHOOTS = [
  { id: 1, client: 'Zara İlkbahar Koleksiyonu', date: 'Bugün', time: '14:00', location: 'Stüdyo 1', status: 'pending', statusLabel: 'Beklemede' },
  { id: 2, client: 'Trendyol Ürün Çekimi', date: 'Yarın', time: '10:00', location: 'Dış Çekim', status: 'confirmed', statusLabel: 'Onaylandı' },
  { id: 3, client: 'Mavi Jeans Kampanya', date: '22 Mar', time: '09:00', location: 'Stüdyo 2', status: 'in-progress', statusLabel: 'Devam Ediyor' },
];

const SHOOT_STATUS_COLORS: Record<string, string> = {
  'pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'confirmed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'in-progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export function WeekShoots() {
  return (
    <Card className="flex flex-col h-full bg-card border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-lg font-semibold">Bu Haftaki Çekimler</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        {MOCK_SHOOTS.length === 0 ? (
          <EmptyState 
            icon={Calendar} 
            title="Çekim Bulunamadı" 
            description="Bu hafta için planlanmış bir çekim görünmüyor." 
          />
        ) : (
          <div className="flex-1">
            {MOCK_SHOOTS.map((shoot) => (
              <div key={shoot.id} className="flex items-center justify-between border-b border-border/50 p-4 last:border-0 hover:bg-muted/30 transition-colors">
                <div className="space-y-1">
                  <p className="font-medium text-sm text-foreground">{shoot.client}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {shoot.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {shoot.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {shoot.location}</span>
                  </div>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${SHOOT_STATUS_COLORS[shoot.status] || 'bg-secondary text-secondary-foreground border-border'}`}>
                  {shoot.statusLabel}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="p-4 border-t border-border/50 mt-auto">
          <Link href="/cekimler" className="text-sm text-primary hover:underline font-medium flex items-center justify-center">
            Tümünü Gör
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
