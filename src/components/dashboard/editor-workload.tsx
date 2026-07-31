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
    // Check also partial name matches (for cases like "Arda Göde" matching "Arda Göde")
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
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-base font-bold">Editör İş Yükü</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs font-mono font-extrabold">
            {totalPending} Aktif Edit
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {sortedEditorStats.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Ekip üyesi bulunmuyor.</p>
        ) : (
          sortedEditorStats.map((editor) => {
            const maxForBar = Math.max(...sortedEditorStats.map((e) => e.assigned), 1);
            const progressPercent = Math.round((editor.assigned / maxForBar) * 100);
            const isOverloaded = editor.assigned >= 5;
            const isMedium = editor.assigned >= 3;
            const barColor = isOverloaded
              ? 'bg-red-500'
              : isMedium
              ? 'bg-amber-500'
              : 'bg-primary';
            const countColor = isOverloaded
              ? 'text-red-400 font-extrabold'
              : isMedium
              ? 'text-amber-400 font-bold'
              : 'text-foreground font-medium';

            return (
              <div key={editor.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full ${editor.color} flex items-center justify-center text-[11px] font-extrabold text-white shrink-0`}
                    >
                      {editor.initials}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-foreground">{editor.name}</span>
                      <p className="text-[10px] text-muted-foreground leading-none">{editor.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs ${countColor}`}>{editor.assigned}</span>
                    <span className="text-[10px] text-muted-foreground">/ edit</span>
                    {isOverloaded && (
                      <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.5 rounded font-bold">
                        Yoğun
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${editor.assigned === 0 ? 0 : Math.max(progressPercent, 4)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}

        {/* Outside editors (not in ekip list) */}
        {Object.keys(outsideEditors).length > 0 && (
          <div className="pt-3 border-t border-border/50 space-y-2">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
              Dış / Freelance Editörler
            </p>
            {Object.entries(outsideEditors).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground border border-border">
                    {name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-foreground">{name}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{count} edit</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
