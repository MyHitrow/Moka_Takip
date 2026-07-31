'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell, Film, AlertCircle, Camera, Building2,
  StickyNote, CheckCircle2, Clock, Filter, Inbox,
  ChevronRight, AlertTriangle, CalendarClock,
} from 'lucide-react';
import { useData } from '@/context/data-context';
import Link from 'next/link';

type NotifType = 'all' | 'overdue' | 'shoot' | 'edit' | 'note' | 'client';

interface Notif {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: React.ElementType;
  type: Exclude<NotifType, 'all'>;
  badge: string;
  priority: 'high' | 'medium' | 'low';
  href?: string;
}

const TYPE_CONFIG: Record<Exclude<NotifType, 'all'>, { label: string; color: string; bg: string; border: string }> = {
  overdue:  { label: 'Gecikmiş Ödeme', color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30' },
  shoot:    { label: 'Çekim',          color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  edit:     { label: 'Edit Görevi',    color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  note:     { label: 'Ekip Notu',      color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30' },
  client:   { label: 'İşletme',        color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/30' },
};

export default function BildirimlerPage() {
  const { gelirler, cekimler, editler, isletmeler, haftalikNotlar, formatDateTr, currentUser } = useData();
  const [activeFilter, setActiveFilter] = useState<NotifType>('all');

  const todayStr = new Date().toISOString().split('T')[0];
  const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const notifications = useMemo<Notif[]>(() => {
    const list: Notif[] = [];

    // 1. Gecikmiş & Bekleyen ödemeler
    gelirler.forEach((g) => {
      if (g.status !== 'paid') {
        const isOverdue = g.status === 'overdue' || (g.status === 'pending' && g.date < todayStr);
        list.push({
          id: `g-${g.id}`,
          title: `${isOverdue ? '🚨' : '⏳'} Ödeme ${isOverdue ? 'Gecikmesi' : 'Bekliyor'}: ${g.client}`,
          message: `${g.description} — ${(g.amount - (g.paidAmount || 0)).toLocaleString('tr-TR')} ₺ tahsil bekleniyor.`,
          time: formatDateTr(g.date),
          icon: isOverdue ? AlertCircle : Clock,
          type: 'overdue',
          badge: isOverdue ? 'Gecikmiş' : 'Bekliyor',
          priority: isOverdue ? 'high' : 'medium',
          href: '/gelirler',
        });
      }
    });

    // 2. Bu haftaki ve gelecek çekimler
    cekimler
      .filter((c) => c.date >= todayStr && c.date <= weekLater && c.status !== 'cancelled')
      .forEach((c) => {
        list.push({
          id: `c-${c.id}`,
          title: `🎬 Yaklaşan Çekim: ${c.client}`,
          message: `"${c.title}" — ${c.location}, saat ${c.time}`,
          time: formatDateTr(c.date),
          icon: Camera,
          type: 'shoot',
          badge: 'Çekim Takvimi',
          priority: c.date === todayStr ? 'high' : 'medium',
          href: '/cekimler',
        });
      });

    // 3. Deadline'ı geçmiş veya bugün olan editler
    editler
      .filter((e) => !['ready', 'published'].includes(e.status) && e.deadline <= weekLater)
      .forEach((e) => {
        const isOverdue = e.deadline < todayStr;
        const isToday = e.deadline === todayStr;
        list.push({
          id: `e-${e.id}`,
          title: `🎞️ ${isOverdue ? 'Gecikmiş Edit' : isToday ? 'Bugün Teslim' : 'Yaklaşan Teslim'}: ${e.title}`,
          message: `${e.client} — ${e.editor} tarafından yürütülüyor. Teslim: ${formatDateTr(e.deadline)}`,
          time: formatDateTr(e.deadline),
          icon: Film,
          type: 'edit',
          badge: isOverdue ? 'Gecikti!' : isToday ? 'Bugün!' : 'Yaklaşan',
          priority: isOverdue || isToday ? 'high' : 'medium',
          href: '/editler',
        });
      });

    // 4. Haftalık notlar (son 10)
    haftalikNotlar.slice(0, 10).forEach((n) => {
      list.push({
        id: `n-${n.id}`,
        title: `📝 Ekip Notu — @${n.authorUsername}`,
        message: n.content.length > 120 ? n.content.slice(0, 120) + '…' : n.content,
        time: `${formatDateTr(n.date)} ${n.createdAt}`,
        icon: StickyNote,
        type: 'note',
        badge: 'Ekip Notu',
        priority: 'low',
      });
    });

    // 5. Aktif işletmeler (bağlantı bilgisi)
    isletmeler.filter((b) => b.active).forEach((b) => {
      list.push({
        id: `b-${b.id}`,
        title: `🏢 Aktif Sözleşme: ${b.name}`,
        message: `${b.contact} | ${b.phone} | Aylık paket: ${b.fee}`,
        time: 'Aktif',
        icon: Building2,
        type: 'client',
        badge: 'İşletme',
        priority: 'low',
        href: '/isletmeler',
      });
    });

    // Öncelik sırası: high > medium > low
    const order = { high: 0, medium: 1, low: 2 };
    return list.sort((a, b) => order[a.priority] - order[b.priority]);
  }, [gelirler, cekimler, editler, isletmeler, haftalikNotlar, todayStr, weekLater]);

  const filtered = activeFilter === 'all' ? notifications : notifications.filter((n) => n.type === activeFilter);

  const counts: Record<NotifType, number> = {
    all: notifications.length,
    overdue: notifications.filter((n) => n.type === 'overdue').length,
    shoot: notifications.filter((n) => n.type === 'shoot').length,
    edit: notifications.filter((n) => n.type === 'edit').length,
    note: notifications.filter((n) => n.type === 'note').length,
    client: notifications.filter((n) => n.type === 'client').length,
  };

  const highCount = notifications.filter((n) => n.priority === 'high').length;

  const filterTabs: { label: string; value: NotifType; icon: React.ElementType }[] = [
    { label: 'Tümü', value: 'all', icon: Bell },
    { label: 'Ödemeler', value: 'overdue', icon: AlertCircle },
    { label: 'Çekimler', value: 'shoot', icon: Camera },
    { label: 'Editler', value: 'edit', icon: Film },
    { label: 'Notlar', value: 'note', icon: StickyNote },
    { label: 'İşletmeler', value: 'client', icon: Building2 },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Bildirimler"
        subtitle="Canlı sistem uyarıları, ödeme gecikmeleri ve yaklaşan görevler"
        icon={Bell}
      />

      {/* Yüksek Öncelik Banner */}
      {highCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
          <div className="p-2 bg-red-500 rounded-xl shrink-0">
            <AlertTriangle className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-red-300">
              {highCount} yüksek öncelikli bildirim var!
            </p>
            <p className="text-xs text-red-400/80 mt-0.5">
              Gecikmiş ödemeler, bugün teslimi olan editler veya bugünkü çekimler mevcut.
            </p>
          </div>
          <Badge className="bg-red-500 text-white shrink-0 font-bold">{highCount}</Badge>
        </div>
      )}

      {/* Filtre Sekmeleri */}
      <div className="flex flex-wrap gap-2">
        <Filter className="w-4 h-4 text-muted-foreground self-center" />
        {filterTabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeFilter === tab.value;
          const cnt = counts[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {tab.label}
              {cnt > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                }`}>
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bildirim Listesi */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center border-dashed flex flex-col items-center gap-3">
          <Inbox className="w-10 h-10 text-muted-foreground/40" />
          <p className="font-semibold text-muted-foreground">Bu kategoride bildirim yok</p>
          <p className="text-xs text-muted-foreground/60">
            {activeFilter === 'all' ? 'Tüm görevler ve ödemeler güncel görünüyor.' : 'Filreyi değiştirerek diğer kategorilere bakabilirsin.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const Icon = notif.icon;
            const config = TYPE_CONFIG[notif.type];
            const content = (
              <div
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-150 hover:scale-[1.005] hover:shadow-md cursor-default ${config.bg} ${config.border} ${
                  notif.priority === 'high' ? 'ring-1 ring-red-500/20' : ''
                }`}
              >
                {/* İkon */}
                <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 bg-background/60 border-border`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* İçerik */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm text-foreground leading-snug">{notif.title}</h4>
                    <Badge
                      className={`text-[10px] px-1.5 py-0 font-bold ${config.bg} ${config.color} border ${config.border}`}
                    >
                      {notif.badge}
                    </Badge>
                    {notif.priority === 'high' && (
                      <Badge className="text-[10px] px-1.5 py-0 font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        Acil
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                </div>

                {/* Zaman + Link */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap flex items-center gap-1">
                    <CalendarClock className="w-3 h-3" /> {notif.time}
                  </span>
                  {notif.href && (
                    <ChevronRight className={`w-4 h-4 ${config.color} opacity-60`} />
                  )}
                </div>
              </div>
            );

            return notif.href ? (
              <Link key={notif.id} href={notif.href}>{content}</Link>
            ) : (
              <div key={notif.id}>{content}</div>
            );
          })}
        </div>
      )}

      {/* Tümü Tamam Mesajı */}
      {counts.overdue === 0 && counts.edit === 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-400">
            Gecikmiş ödeme ve edit yok — her şey yolunda! 🎉
          </p>
        </div>
      )}
    </div>
  );
}
