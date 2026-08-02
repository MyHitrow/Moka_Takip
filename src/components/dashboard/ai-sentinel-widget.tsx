'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bot, AlertTriangle, ArrowRight, CheckCircle2, Flame, CalendarClock, Camera, Film } from 'lucide-react';
import { useData } from '@/context/data-context';
import { runAISentinelAudit, AISentinelInsight } from '@/lib/ai-sentinel';

export function AiSentinelWidget() {
  const { isletmeler, cekimler, editler, takvimPosts } = useData();

  const insights = useMemo<AISentinelInsight[]>(() => {
    const { insights: res } = runAISentinelAudit({ isletmeler, cekimler, editler, takvimPosts });
    return res;
  }, [isletmeler, cekimler, editler, takvimPosts]);

  const highCount = insights.filter((i) => i.severity === 'high').length;

  return (
    <Card className="p-5 md:p-6 bg-card/90 border-2 border-primary/30 relative overflow-hidden shadow-xl">
      {/* Bot Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/40 text-primary shrink-0 relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base md:text-lg text-foreground">AI Direktör Bekçisi</h3>
              <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px] py-0 px-1.5 font-mono">
                AUTONOMOUS SENTINEL
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              İşletme kotalarınızı, paylaşım aralıklarınızı ve kurgu stoklarınızı 7/24 denetler.
            </p>
          </div>
        </div>

        {insights.length > 0 && (
          <Badge className={`self-start sm:self-auto font-bold text-xs ${
            highCount > 0
              ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }`}>
            {insights.length} UYARI / AKSİYON GEREKLİ
          </Badge>
        )}
      </div>

      {/* Insights List */}
      <div className="mt-4 space-y-3">
        {insights.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-sm text-emerald-300">Tüm işletmeler hedeflerinde ve akışta! 🎉</p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Hiçbir işletmenin paylaşım aralığı kopmadı, tüm kotalar ve kurgu stokları mükemmel ilerliyor.
              </p>
            </div>
          </div>
        ) : (
          insights.map((item) => {
            const isHigh = item.severity === 'high';
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isHigh
                    ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                    : 'bg-amber-500/8 border-amber-500/25 hover:border-amber-500/45'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-background/60 border border-border shrink-0 mt-0.5">
                    {item.type === 'delay' ? (
                      <CalendarClock className="w-4 h-4 text-amber-400" />
                    ) : item.type === 'shoot_missing' ? (
                      <Camera className="w-4 h-4 text-blue-400" />
                    ) : item.type === 'stock_empty' ? (
                      <Film className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Flame className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-sm text-foreground leading-snug">{item.title}</h4>
                      {isHigh && (
                        <Badge className="bg-red-500 text-white text-[9px] py-0 px-1 font-bold">ACİL</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {item.actionHref && (
                  <Link href={item.actionHref} className="self-end sm:self-auto shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-bold bg-background hover:bg-muted border-border"
                    >
                      {item.actionText || 'Aksiyon Al'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
