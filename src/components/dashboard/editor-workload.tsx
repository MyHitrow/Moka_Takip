import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const MOCK_EDITORS = [
  { id: 1, name: 'Ahmet Yılmaz', initials: 'AY', assigned: 8, capacity: 10, color: 'bg-primary' },
  { id: 2, name: 'Ayşe Demir', initials: 'AD', assigned: 5, capacity: 10, color: 'bg-emerald-500' },
  { id: 3, name: 'Can Kaya', initials: 'CK', assigned: 11, capacity: 10, color: 'bg-red-500' },
  { id: 4, name: 'Zeynep Çelik', initials: 'ZÇ', assigned: 3, capacity: 10, color: 'bg-blue-500' },
];

export function EditorWorkload() {
  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-lg font-semibold">Editör İş Yükü</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {MOCK_EDITORS.map((editor) => {
          const progressPercentage = Math.min((editor.assigned / editor.capacity) * 100, 100);
          const isOverloaded = editor.assigned > editor.capacity;
          
          return (
            <div key={editor.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground border border-border">
                    {editor.initials}
                  </div>
                  <span className="text-sm font-medium text-foreground">{editor.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className={isOverloaded ? "text-red-400 font-bold" : "text-foreground font-medium"}>
                    {editor.assigned}
                  </span>
                  {' '} / {editor.capacity} proje
                </div>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${isOverloaded ? 'bg-red-500' : 'bg-primary'} transition-all`} 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
