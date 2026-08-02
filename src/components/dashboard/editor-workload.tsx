'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/data-context';

export function EditorWorkload() {
  const { editler, ekip } = useData();

  // Count active (pending) edits per editor dynamically
  const pendingEdits = editler.filter(
    (e) => e.status !== 'ready' && e.status !== 'published'
  );

  // Build workload map: normalize editor names and match against ekip
  const workloadMap: Record<string, number> = {};
  pendingEdits.forEach((edit) => {
    const key = edit.editor.trim().toLowerCase();
    workloadMap[key] = (workloadMap[key] || 0) + 1;
  });

  // Calculate maximum assigned count among team members to scale 0-100%
  const maxAssigned = Math.max(...ekip.map((m) => {
    const k = m.name.trim().toLowerCase();
    return workloadMap[k] || 0;
  }), 1);

  // Build editor list dynamically
  const editorStats = ekip.map((member) => {
    const key = member.name.trim().toLowerCase();
    const assigned = workloadMap[key] || 0;
    const percent = Math.round((assigned / maxAssigned) * 100);

    return {
      ...member,
      assigned,
      percent: assigned === 0 ? 0 : Math.max(percent, 10),
    };
  });

  const sortedEditorStats = [...editorStats].sort((a, b) => b.assigned - a.assigned);
  const totalPending = pendingEdits.length;

  return (
    <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
      <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-[#F7F7F8]">İş Yükü Dağılımı ({totalPending} Aktif)</CardTitle>
        <span className="text-xs text-[#73767E] bg-[#1D1F23] border border-[#2B2D32] px-2 py-0.5 rounded-md font-semibold">
          Ekip
        </span>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {sortedEditorStats.length === 0 ? (
          <p className="text-xs text-[#73767E] text-center py-4">Ekip üyesi bulunmuyor.</p>
        ) : (
          sortedEditorStats.map((member) => (
            <div key={member.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#24262B] border border-[#34363C] flex items-center justify-center text-[10px] font-extrabold text-[#F7F7F8] shrink-0">
                    {member.initials}
                  </div>
                  <div>
                    <span className="font-bold text-[#F7F7F8] block leading-tight text-xs">{member.name}</span>
                    <span className="text-[10px] text-[#73767E]">{member.role} ({member.assigned} edit)</span>
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
          ))
        )}
      </CardContent>
    </Card>
  );
}
