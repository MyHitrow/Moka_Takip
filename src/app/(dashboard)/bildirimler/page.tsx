'use client';

import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Film, CheckCircle2, AlertCircle, Camera, Building2, StickyNote } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function BildirimlerPage() {
  const { gelirler, cekimler, editler, isletmeler, haftalikNotlar, formatDateTr } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  // Dynamically generate notifications from live system state
  const notifications: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    icon: any;
    type: 'overdue' | 'shoot' | 'edit' | 'client' | 'note';
    badge: string;
    color: string;
  }> = [];

  // 1. Overdue payments
  gelirler.forEach((g) => {
    if (g.status === 'overdue' || (g.status === 'pending' && g.date < todayStr)) {
      notifications.push({
        id: `g-${g.id}`,
        title: `🚨 Ödeme Gecikmesi: ${g.client}`,
        message: `${g.description} bedeli (${g.amount.toLocaleString('tr-TR')} ₺) son ödeme tarihini geçti.`,
        time: formatDateTr(g.date),
        icon: AlertCircle,
        type: 'overdue',
        badge: 'Gecikmiş Ödeme',
        color: 'bg-red-500/10 border-red-500/30 text-red-400',
      });
    }
  });

  // 2. Upcoming Shoots
  cekimler.forEach((c) => {
    notifications.push({
      id: `c-${c.id}`,
      title: `🎬 Planlanan Çekim: ${c.client}`,
      message: `"${c.title}" çekimi ${c.location} konumunda saat ${c.time}'de başlayacaktır.`,
      time: formatDateTr(c.date),
      icon: Camera,
      type: 'shoot',
      badge: 'Çekim Takvimi',
      color: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    });
  });

  // 3. Edits in progress
  editler.forEach((e) => {
    notifications.push({
      id: `e-${e.id}`,
      title: `🎞️ Edit Görevi: ${e.title}`,
      message: `${e.client} için ${e.type} kurgusu (${e.editor}) tarafından yürütülmektedir. Teslim: ${formatDateTr(e.deadline)}`,
      time: formatDateTr(e.deadline),
      icon: Film,
      type: 'edit',
      badge: e.status === 'ready' ? 'Yayına Hazır' : 'Kurguda',
      color: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    });
  });

  // 4. Weekly Notes
  haftalikNotlar.forEach((n) => {
    notifications.push({
      id: `n-${n.id}`,
      title: `📝 Ekip Notu (@${n.authorUsername})`,
      message: n.content,
      time: `${formatDateTr(n.date)} ${n.createdAt}`,
      icon: StickyNote,
      type: 'note',
      badge: 'Haftalık Not',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    });
  });

  // 5. Active Clients
  isletmeler.forEach((b) => {
    if (b.active) {
      notifications.push({
        id: `b-${b.id}`,
        title: `🏢 Aktif İşletme: ${b.name}`,
        message: `${b.contact} ile anlaşmalı aylık paket: ${b.fee}`,
        time: 'Aktif Sözleşme',
        icon: Building2,
        type: 'client',
        badge: 'İşletme',
        color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      });
    }
  });

  return (
    <div>
      <Header title="Bildirimler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader 
          title="Canlı Bildirimler" 
          subtitle="Sistem olayları, ödeme uyarıları ve çekim güncellemeleri" 
          icon={Bell} 
        />
        
        <div className="mt-6 space-y-3 max-w-4xl">
          {notifications.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Henüz yeni bir bildirim bulunmuyor.
            </Card>
          ) : (
            notifications.map((notif) => {
              const Icon = notif.icon;
              return (
                <Card 
                  key={notif.id} 
                  className={`p-4 bg-card border flex items-start gap-4 transition-all hover:border-primary/50 shadow-xs ${notif.color}`}
                >
                  <div className="p-2 rounded-xl bg-background border border-border shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">
                          {notif.title}
                        </h4>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {notif.badge}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-medium">
                      {notif.message}
                    </p>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
