'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const teamWorkload = [
  { id: '1', name: 'Büşra Arslan', role: 'Editör', initials: 'BA', percent: 85 },
  { id: '2', name: 'Mert Yıldız', role: 'Video Editör', initials: 'MY', percent: 70 },
  { id: '3', name: 'Ece Korkmaz', role: 'İçerik Üreticisi', initials: 'EK', percent: 60 },
  { id: '4', name: 'Hakan Yılmaz', role: 'Yönetmen', initials: 'HY', percent: 40 },
  { id: '5', name: 'Bilge Aksoy', role: 'Grafik Tasarımcı', initials: 'BA', percent: 30 },
];

export function EditorWorkload() {
  return (
    <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">İş Yükü Dağılımı</CardTitle>
        <select className="bg-[#1D1F23] border border-[#2B2D32] text-xs text-[#B5B7BD] rounded-md px-2 py-1 font-semibold outline-none">
          <option value="tumu">Tümü</option>
          <option value="editor">Editörler</option>
          <option value="yonetmen">Yönetmenler</option>
        </select>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {teamWorkload.map((member) => (
          <div key={member.id} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#24262B] border border-[#34363C] flex items-center justify-center text-[10px] font-extrabold text-[#F7F7F8] shrink-0">
                  {member.initials}
                </div>
                <div>
                  <span className="font-bold text-[#F7F7F8] block leading-tight text-xs">{member.name}</span>
                  <span className="text-[10px] text-[#73767E]">{member.role}</span>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#B5B7BD]">%{member.percent}</span>
            </div>
            <div className="h-1.5 w-full bg-[#1D1F23] rounded-full overflow-hidden border border-[#2B2D32]/60">
              <div
                className="h-full bg-[#E32636] rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${member.percent}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
