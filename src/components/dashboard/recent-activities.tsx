'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/data-context';

export function RecentActivities() {
  const { haftalikNotlar, editler, cekimler, formatDateTr } = useData();

  // Map notes as activities
  const noteActivities = haftalikNotlar.map((n) => ({
    id: `note-${n.id}`,
    initials: n.authorName ? n.authorName.substring(0, 2).toUpperCase() : 'AK',
    user: n.authorName || n.authorUsername,
    action: n.client ? `${n.client} için not ekledi: "${n.content}"` : `Not ekledi: "${n.content}"`,
    dateStr: n.date,
    time: `${formatDateTr(n.date)} ${n.createdAt || ''}`,
  }));

  // Map recent edits as activities
  const editActivities = editler.slice(0, 3).map((e) => ({
    id: `edit-${e.id}`,
    initials: e.editor ? e.editor.substring(0, 2).toUpperCase() : 'ED',
    user: e.editor || 'Editör',
    action: `${e.client} için "${e.title}" editini güncelledi (${e.status}).`,
    dateStr: e.deadline,
    time: formatDateTr(e.deadline),
  }));

  // Combine and take top 5 recent activities
  const allActivities = [...noteActivities, ...editActivities].slice(0, 5);

  return (
    <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">Son Aktiviteler</CardTitle>
        <Link href="/bildirimler" className="text-xs text-[#73767E] hover:text-[#F7F7F8] font-semibold flex items-center gap-1 transition-colors bg-[#1D1F23] border border-[#2B2D32] px-2.5 py-1 rounded-md">
          Tümünü Gör
        </Link>
      </CardHeader>
      <CardContent className="p-4 space-y-3.5">
        {allActivities.length === 0 ? (
          <p className="text-xs text-[#73767E] text-center py-4">Son aktivite bulunmuyor.</p>
        ) : (
          allActivities.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-full bg-[#24262B] border border-[#34363C] flex items-center justify-center text-[10px] font-bold text-[#F7F7F8] shrink-0">
                  {item.initials}
                </div>
                <p className="text-[#B5B7BD] truncate">
                  <strong className="text-[#F7F7F8] font-semibold">{item.user}</strong>, {item.action}
                </p>
              </div>
              <span className="text-[11px] text-[#73767E] shrink-0 ml-4 font-mono">{item.time}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
