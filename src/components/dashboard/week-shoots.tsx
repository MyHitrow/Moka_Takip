'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical, Film } from 'lucide-react';
import { useData } from '@/context/data-context';

export function WeekShoots() {
  const { cekimler, editler, formatDateTr } = useData();

  // Combine shoots and edits for Yaklaşan İşler table or map formatted rows matching screenshot
  const upcomingJobs = [
    {
      id: '1',
      title: 'Yaz Kampanyası',
      sub: 'Reels Serisi',
      client: 'ModaPlus',
      type: 'Reels Edit',
      date: '26 Mayıs 2024',
      remaining: '2 gün kaldı',
      status: 'Devam Ediyor',
      progress: 65,
    },
    {
      id: '2',
      title: 'Ürün Tanıtım Videosu',
      sub: 'Video Prodüksiyon',
      client: 'TechMarket',
      type: 'Video Prodüksiyon',
      date: '28 Mayıs 2024',
      remaining: '4 gün kaldı',
      status: 'Devam Ediyor',
      progress: 40,
    },
    {
      id: '3',
      title: 'Etkinlik Çekimi',
      sub: 'Video Çekim',
      client: 'Groupama',
      type: 'Video Çekim',
      date: '30 Mayıs 2024',
      remaining: '6 gün kaldı',
      status: 'Planlandı',
      progress: 20,
    },
    {
      id: '4',
      title: 'Sosyal Medya Yönetimi',
      sub: 'İçerik Yönetimi',
      client: 'Cafe Nero',
      type: 'İçerik Yönetimi',
      date: '01 Haziran 2024',
      remaining: '8 gün kaldı',
      status: 'Devam Ediyor',
      progress: 75,
    },
    {
      id: '5',
      title: 'Reklam Filmi',
      sub: 'Video Prodüksiyon',
      client: 'Lunar Watches',
      type: 'Video Prodüksiyon',
      date: '05 Haziran 2024',
      remaining: '12 gün kaldı',
      status: 'Onay Bekliyor',
      progress: 90,
    },
  ];

  return (
    <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">Yaklaşan İşler</CardTitle>
        <Link href="/cekimler" className="text-xs text-[#73767E] hover:text-[#F7F7F8] font-semibold flex items-center gap-1 transition-colors bg-[#1D1F23] border border-[#2B2D32] px-2.5 py-1 rounded-md">
          Tümünü Gör
        </Link>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#111214] text-[10px] uppercase font-bold text-[#73767E] border-b border-[#2B2D32]">
            <tr>
              <th className="py-3 px-4">İŞ / PROJE</th>
              <th className="py-3 px-4">MÜŞTERİ</th>
              <th className="py-3 px-4">TÜR</th>
              <th className="py-3 px-4">TESLİM TARİHİ</th>
              <th className="py-3 px-4">DURUM</th>
              <th className="py-3 px-4">İLERLEME</th>
              <th className="py-3 px-2 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2B2D32]/60">
            {upcomingJobs.map((job) => (
              <tr key={job.id} className="hover:bg-[#24262B] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#24262B] border border-[#34363C] flex items-center justify-center shrink-0 text-[#E32636]">
                      <Film className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[#F7F7F8] block text-xs">{job.title}</span>
                      <span className="text-[10px] text-[#73767E]">{job.sub}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-[#B5B7BD]">{job.client}</td>
                <td className="py-3 px-4 text-[#73767E]">{job.type}</td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-[#F7F7F8] block text-[11px]">{job.date}</span>
                  <span className="text-[10px] text-[#73767E]">{job.remaining}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                      job.status === 'Onay Bekliyor'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : job.status === 'Planlandı'
                        ? 'bg-[#1D1F23] text-[#B5B7BD] border-[#2B2D32]'
                        : 'bg-[#24262B] text-[#F7F7F8] border-[#34363C]'
                    }`}
                  >
                    {job.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 w-28">
                    <span className="text-[11px] font-bold text-[#F7F7F8] min-w-[28px]">%{job.progress}</span>
                    <div className="h-1.5 flex-1 bg-[#1D1F23] rounded-full overflow-hidden border border-[#2B2D32]">
                      <div
                        className="h-full bg-[#E32636] rounded-full"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <button className="p-1 text-[#73767E] hover:text-[#F7F7F8] rounded-md hover:bg-[#24262B]">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
