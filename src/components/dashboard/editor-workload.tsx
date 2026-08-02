'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/data-context';
import { Users } from 'lucide-react';

export function EditorWorkload() {
  const { editler, ekip } = useData();

  // Count active (pending) edits per editor
  const pendingEdits = editler.filter(
    (e) => e.status !== 'ready' && e.status !== 'published'
  );

  // Build workload map: normalize editor names and match against ekip
  const workloadMap: Record<string, number> = {};
  pendingEdits.forEach((edit) => {
    const key = edit.editor.trim().toLowerCase();
    workloadMap[key] = (workloadMap[key] || 0) + 1;
  });

  // Build editor list from ekip, with assigned count from editler
  const editorStats = ekip.map((member) => {
    const key = member.name.trim().toLowerCase();
    const assigned = workloadMap[key] || 0;
    const directMatch = assigned;
    const partialMatch = directMatch === 0
      ? Object.entries(workloadMap).reduce((acc, [k, v]) => {
          if (k.includes(key.split(' ')[0]) || key.includes(k.split(' ')[0])) {
            return acc + v;
          }
          return acc;
        }, 0)
      : 0;

    return {
      ...member,
      assigned: directMatch + partialMatch,
    };
  });

  // Also count edits from editors NOT in the ekip list
  const outsideEditors: Record<string, number> = {};
  pendingEdits.forEach((edit) => {
    const editorName = edit.editor.trim();
    if (editorName === 'Atanmadı' || editorName === '') return;
    const isInEkip = ekip.some((m) =>
      m.name.trim().toLowerCase() === editorName.toLowerCase()
    );
    if (!isInEkip) {
      outsideEditors[editorName] = (outsideEditors[editorName] || 0) + 1;
    }
  });

  // Sort ekip by assigned count desc
  const sortedEditorStats = [...editorStats].sort((a, b) => b.assigned - a.assigned);
  const totalPending = pendingEdits.length;

  return (
    <Card className="h-full bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#E32636]/10 p-1.5 rounded-lg text-[#E32636]">
              <Users className="w-4 h-4" />
            </div>
            <CardTitle className="text-sm font-bold text-[#F7F7F8]">İş Yükü Dağılımı</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[11px] font-mono font-extrabold bg-[#1D1F23] border-[#2B2D32] text-[#B5B7BD]">
            {totalPending} Aktif İş
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {sortedEditorStats.length === 0 ? (
          <p className="text-xs text-[#73767E] text-center py-4">Ekip üyesi bulunmuyor.</p>
        ) : (
          sortedEditorStats.map((editor) => {
            const maxForBar = Math.max(...sortedEditorStats.map((e) => e.assigned), 1);
            const progressPercent = Math.round((editor.assigned / maxForBar) * 100);

            return (
              <div key={editor.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#24262B] border border-[#34363C] flex items-center justify-center text-[11px] font-extrabold text-[#F7F7F8] shrink-0">
                      {editor.initials}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#F7F7F8] block leading-tight">{editor.name}</span>
                      <span className="text-[10px] text-[#73767E]">{editor.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#F7F7F8]">%{editor.assigned === 0 ? 0 : Math.min(progressPercent, 95)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-[#1D1F23] rounded-full overflow-hidden border border-[#2B2D32]/60">
                  <div
                    className="h-full bg-[#E32636] rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${editor.assigned === 0 ? 0 : Math.max(progressPercent, 6)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Outside editors */}
        {Object.keys(outsideEditors).length > 0 && (
          <div className="pt-3 border-t border-[#2B2D32] space-y-2">
            <p className="text-[10px] text-[#73767E] font-semibold uppercase tracking-wider">
              Dış / Freelance Editörler
            </p>
            {Object.entries(outsideEditors).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#24262B] flex items-center justify-center text-[10px] font-bold text-[#B5B7BD] border border-[#2B2D32]">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-[#F7F7F8]">{name}</span>
                </div>
                <span className="text-xs font-bold text-[#E32636]">{count} edit</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
