'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bot,
  CheckCircle2,
  CalendarClock,
  Camera,
  Film,
  Flame,
  ArrowRight,
  ShieldCheck,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import { useData } from '@/context/data-context';
import { runAISentinelAudit } from '@/lib/ai-sentinel';

export default function AiDirektorPage() {
  const { isletmeler, cekimler, editler, takvimPosts, gelirler } = useData();

  const { insights, clientReports, agencyHealthScore } = useMemo(() => {
    return runAISentinelAudit({ isletmeler, cekimler, editler, takvimPosts, gelirler });
  }, [isletmeler, cekimler, editler, takvimPosts, gelirler]);

  const highCount = insights.filter((i) => i.severity === 'high').length;
  const criticalClients = clientReports.filter((c) => c.status === 'critical').length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-0 md:pt-6 bg-[#0D0E10] min-h-screen">
      <Header title="AI Direktör" subtitle="Otonom operasyon takibi ve işletme hedef raporları" />

      <PageHeader
        title="🤖 AI Direktör & Otonom Bekçi Raporları"
        subtitle="İşletmelerinizin Reels kotalarını, çekim hedeflerini ve paylaşım aralıklarını 7/24 denetler."
        icon={Bot}
      />

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health Score */}
        <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#73767E]">Ajans Sağlık Skoru</span>
            <ShieldCheck className="w-4 h-4 text-[#E32636]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-[#F7F7F8]">%{agencyHealthScore}</span>
            <span className={`text-xs font-bold ${agencyHealthScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {agencyHealthScore >= 80 ? 'Mükemmel Akış' : 'Aksiyon Gerekli'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1D1F23] rounded-full overflow-hidden border border-[#2B2D32] mt-3">
            <div
              className={`h-full rounded-full ${agencyHealthScore >= 80 ? 'bg-emerald-500' : 'bg-[#E32636]'}`}
              style={{ width: `${agencyHealthScore}%` }}
            />
          </div>
        </Card>

        {/* Card 2: Monitored Clients */}
        <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#73767E]">Takip Edilen İşletmeler</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-black text-[#F7F7F8]">{clientReports.length}</span>
            <span className="text-xs text-[#73767E] ml-2">Aktif Anlaşmalı Müşteri</span>
          </div>
        </Card>

        {/* Card 3: Active AI Insights */}
        <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#73767E]">AI Aksiyon / Uyarılar</span>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black text-[#F7F7F8]">{insights.length}</span>
            {highCount > 0 && (
              <Badge className="bg-[#E32636]/20 text-[#FF3545] border border-[#E32636]/40 text-[10px] font-extrabold animate-pulse">
                {highCount} ACİL
              </Badge>
            )}
          </div>
        </Card>

        {/* Card 4: Critical Clients */}
        <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#73767E]">Aksayan İşletmeler</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2">
            <span className="text-2xl md:text-3xl font-black text-[#F7F7F8]">{criticalClients}</span>
            <span className="text-xs text-[#73767E] ml-2">Geride Kalan İşletme</span>
          </div>
        </Card>
      </div>

      {/* Section 1: Prioritized AI Insights / Action Items */}
      <Card className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl">
        <CardHeader className="pb-3 border-b border-[#2B2D32] flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#F7F7F8] flex items-center gap-2">
            <span>AI Öncelikli Aksiyon ve Uyarılar</span>
            <Badge className="bg-[#E32636]/15 text-[#E32636] border border-[#E32636]/30 font-bold text-[10px]">
              {insights.length} UYARI
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {insights.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-300">Tüm işletmeler hedeflerinde ve akışta! 🎉</p>
                <p className="text-xs text-emerald-400/80 mt-0.5">
                  Hiçbir işletmenin paylaşım aralığı kopmadı, tüm Reels kotaları ve kurgu stokları mükemmel ilerliyor.
                </p>
              </div>
            </div>
          ) : (
            insights.map((item) => {
              const isHigh = item.severity === 'high';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isHigh
                      ? 'bg-[#E32636]/10 border-[#E32636]/40'
                      : 'bg-[#1D1F23] border-[#2B2D32]'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-[#0D0E10] border border-[#2B2D32] shrink-0 mt-0.5">
                      {item.type === 'delay' ? (
                        <CalendarClock className="w-4 h-4 text-amber-400" />
                      ) : item.type === 'shoot_missing' ? (
                        <Camera className="w-4 h-4 text-blue-400" />
                      ) : item.type === 'stock_empty' ? (
                        <Film className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Flame className="w-4 h-4 text-[#E32636]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-[#F7F7F8] leading-snug">{item.title}</h4>
                        {isHigh && (
                          <Badge className="bg-[#E32636] text-white text-[9px] py-0 px-1 font-bold">ACİL</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#B5B7BD] mt-1 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                  {item.actionHref && (
                    <Link href={item.actionHref} className="self-end sm:self-auto shrink-0">
                      <Button
                        size="sm"
                        className="h-8 text-xs font-bold bg-[#E32636] hover:bg-[#FF3545] text-white red-button-shadow"
                      >
                        {item.actionText || 'Aksiyon Al'} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Section 2: Detailed Business Target & Realization Cards */}
      <div className="space-y-3 pt-2">
        <h2 className="text-sm font-bold text-[#F7F7F8] flex items-center justify-between">
          <span>İşletme Bazlı Hedef & Kota Durum Raporları ({clientReports.length})</span>
          <Link href="/isletmeler" className="text-xs text-[#73767E] hover:text-[#F7F7F8] font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Hedefleri Düzenle
          </Link>
        </h2>

        {clientReports.length === 0 ? (
          <p className="text-xs text-[#73767E] text-center py-8">Henüz kayıtlı aktif işletme bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clientReports.map((report) => (
              <Card key={report.id} className="bg-[#17181B] border border-[#2B2D32] panel-shadow rounded-xl p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#2B2D32]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#24262B] border border-[#34363C] flex items-center justify-center font-bold text-xs text-[#F7F7F8]">
                      {report.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#F7F7F8] leading-tight">{report.name}</h3>
                      <span className="text-[10px] text-[#73767E]">Paket Hedefleri Akışta</span>
                    </div>
                  </div>
                  <Badge
                    className={`font-mono text-xs font-bold ${
                      report.status === 'excellent'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : report.status === 'warning'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-[#E32636]/15 text-[#FF3545] border border-[#E32636]/30'
                    }`}
                  >
                    %{report.healthScore} Sağlık
                  </Badge>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-3 text-xs">
                  {/* Reels Quota */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[#73767E] font-medium">Aylık Reels Kotası:</span>
                      <span className="font-bold text-[#F7F7F8]">
                        {report.reelsRealized} / {report.reelsTarget} Reels
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1D1F23] rounded-full overflow-hidden border border-[#2B2D32]">
                      <div
                        className="h-full bg-[#E32636] rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(Math.round((report.reelsRealized / report.reelsTarget) * 100), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Shoot Target */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#2B2D32]/50">
                    <span className="text-[#73767E] font-medium">Aylık Çekim Hedefi:</span>
                    <span className="font-bold text-[#F7F7F8]">
                      {report.shootRealized} / {report.shootTarget} Çekim
                    </span>
                  </div>

                  {/* Post Gap */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#2B2D32]/50">
                    <span className="text-[#73767E] font-medium">Son Paylaşım Arayı:</span>
                    <span className={`font-bold ${report.daysSinceLastPost > report.postGapMax ? 'text-[#FF3545]' : 'text-[#F7F7F8]'}`}>
                      {report.daysSinceLastPost} gün önce (Max {report.postGapMax} gün)
                    </span>
                  </div>

                  {/* Edit Stock */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#2B2D32]/50">
                    <span className="text-[#73767E] font-medium">Onaylı Kurgu Stoğu:</span>
                    <span className={`font-bold ${report.readyEditsStock === 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {report.readyEditsStock} adet hazır
                    </span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-[#2B2D32] flex items-center justify-between">
                  <Link href={`/isletmeler/${report.id}`} className="w-full">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-[#2B2D32] bg-[#1D1F23] hover:bg-[#24262B] text-[#F7F7F8]">
                      İşletme Detayına Git →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
