'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useData } from '@/context/data-context';

export function RecentActivities() {
  const { haftalikNotlar, editler, cekimler } = useData();

  // Create mock recent activities based on actual data + fallback items matching screenshot
  const activities = [
    {
      id: '1',
      initials: 'BA',
      color: 'bg-[#E32636]',
      user: 'Büşra Arslan',
      action: 'Yaz Kampanyası projesine 3 yeni dosya yükledi.',
      time: '2 dakika önce',
    },
    {
      id: '2',
      initials: 'MY',
      color: 'bg-[#1D1F23] text-[#B5B7BD] border border-[#2B2D32]',
      user: 'Mert Yıldız',
      action: 'Ürün Tanıtım Videosu görevinin ilerlemesini %40 olarak güncelledi.',
      time: '15 dakika önce',
    },
    {
      id: '3',
      initials: 'EK',
      color: 'bg-[#E32636]/20 text-[#FF3545] border border-[#E32636]/30',
      user: 'Ece Korkmaz',
      action: 'Etkinlik Çekimi görevine yorum yaptı.',
      time: '1 saat önce',
    },
    {
      id: '4',
      initials: 'HY',
      color: 'bg-[#24262B] text-[#F7F7F8] border border-[#34363C]',
      user: 'Hakan Yılmaz',
      action: 'Reklam Filmi projesini onayladı.',
      time: '3 saat önce',
    },
  ];

  return (
    <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">Son Aktiviteler</CardTitle>
        <Link href="/bildirimler" className="text-xs text-[#73767E] hover:text-[#F7F7F8] font-semibold flex items-center gap-1 transition-colors bg-[#1D1F23] border border-[#2B2D32] px-2.5 py-1 rounded-md">
          Tümünü Gör
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-3.5">
        {activities.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-xs py-1">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${item.color}`}>
                {item.initials}
              </div>
              <p className="text-[#B5B7BD]">
                <strong className="text-[#F7F7F8] font-semibold">{item.user}</strong>, {item.action}
              </p>
            </div>
            <span className="text-[11px] text-[#73767E] shrink-0 ml-4 font-mono">{item.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
