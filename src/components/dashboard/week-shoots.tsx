'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreVertical, Film, Calendar as CalendarIcon } from 'lucide-react';
import { useData } from '@/context/data-context';
import { EmptyState } from '../shared/empty-state';
import { SHOOT_STATUS_LABELS, EDIT_STATUS_LABELS } from '@/lib/constants';

export function WeekShoots() {
  const { cekimler, editler, formatDateTr } = useData();

  // Combine shoots and edits into dynamic upcoming jobs
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const getRemainingDaysText = (dateStr: string) => {
    if (!dateStr) return 'Tarih yok';
    const target = new Date(dateStr);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} gün gecikti`;
    if (diffDays === 0) return 'Bugün';
    return `${diffDays} gün kaldı`;
  };

  const getProgressPercent = (status: string, type: 'shoot' | 'edit') => {
    if (type === 'shoot') {
      switch (status) {
        case 'draft': return 15;
        case 'planned': return 35;
        case 'ready': return 55;
        case 'shot': return 75;
        case 'files_transferred': return 90;
        case 'completed': return 100;
        default: return 40;
      }
    } else {
      switch (status) {
        case 'waiting': return 20;
        case 'assigned': return 35;
        case 'editing': return 60;
        case 'internal_review': return 75;
        case 'client_review': return 85;
        case 'ready': return 95;
        case 'published': return 100;
        default: return 50;
      }
    }
  };

  // Convert shoots to job format
  const shootJobs = cekimler.map((s) => ({
    id: `shoot-${s.id}`,
    title: s.title,
    sub: s.location || 'Çekim Alanı',
    client: s.client,
    type: 'Video Çekim',
    dateStr: s.date,
    formattedDate: formatDateTr(s.date),
    remaining: getRemainingDaysText(s.date),
    statusLabel: SHOOT_STATUS_LABELS[s.status as keyof typeof SHOOT_STATUS_LABELS] || s.status,
    rawStatus: s.status,
    progress: getProgressPercent(s.status, 'shoot'),
  }));

  // Convert edits to job format
  const editJobs = editler.map((e) => ({
    id: `edit-${e.id}`,
    title: e.title,
    sub: `${e.type} • ${e.editor}`,
    client: e.client,
    type: `${e.type} Edit`,
    dateStr: e.deadline,
    formattedDate: formatDateTr(e.deadline),
    remaining: getRemainingDaysText(e.deadline),
    statusLabel: EDIT_STATUS_LABELS[e.status as keyof typeof EDIT_STATUS_LABELS] || e.status,
    rawStatus: e.status,
    progress: getProgressPercent(e.status, 'edit'),
  }));

  // Merge and sort by date ascending
  const allJobs = [...shootJobs, ...editJobs].sort((a, b) => (a.dateStr || '').localeCompare(b.dateStr || ''));
  const displayJobs = allJobs.slice(0, 6);

  return (
    <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">Yaklaşan İşler ({allJobs.length})</CardTitle>
        <Link href="/cekimler" className="text-xs text-[#73767E] hover:text-[#F7F7F8] font-semibold flex items-center gap-1 transition-colors bg-[#1D1F23] border border-[#2B2D32] px-2.5 py-1 rounded-md">
          Tümünü Gör
        </Link>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        {displayJobs.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={CalendarIcon}
              title="Yaklaşan İş Bulunamadı"
              description="Henüz eklenmiş çekim veya edit kaydı bulunmuyor."
            />
          </div>
        ) : (
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
              {displayJobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#24262B] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#24262B] border border-[#34363C] flex items-center justify-center shrink-0 text-[#E32636]">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-[#F7F7F8] block text-xs truncate max-w-[160px]">{job.title}</span>
                        <span className="text-[10px] text-[#73767E] truncate max-w-[160px] block">{job.sub}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#B5B7BD]">{job.client}</td>
                  <td className="py-3 px-4 text-[#73767E]">{job.type}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#F7F7F8] block text-[11px]">{job.formattedDate}</span>
                    <span className="text-[10px] text-[#73767E]">{job.remaining}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                        ['client_review', 'internal_review'].includes(job.rawStatus)
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : ['completed', 'ready', 'published'].includes(job.rawStatus)
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#24262B] text-[#F7F7F8] border-[#34363C]'
                      }`}
                    >
                      {job.statusLabel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 w-28">
                      <span className="text-[11px] font-bold text-[#F7F7F8] min-w-[28px]">%{job.progress}</span>
                      <div className="h-1.5 flex-1 bg-[#1D1F23] rounded-full overflow-hidden border border-[#2B2D32]">
                        <div
                          className="h-full bg-[#E32636] rounded-full transition-all duration-300"
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
        )}
      </CardContent>
    </Card>
  );
}
