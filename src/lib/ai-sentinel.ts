import { Isletme, Cekim, EditItem, TakvimPost } from '@/types/app';

export interface AISentinelInsight {
  id: string;
  client: string;
  type: 'delay' | 'quota_lag' | 'stock_empty' | 'shoot_missing';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  daysSinceLastPost?: number;
  completedQuota?: number;
  targetQuota?: number;
  actionHref?: string;
  actionText?: string;
}

export function runAISentinelAudit({
  isletmeler,
  cekimler,
  editler,
  takvimPosts,
}: {
  isletmeler: Isletme[];
  cekimler: Cekim[];
  editler: EditItem[];
  takvimPosts: TakvimPost[];
}): AISentinelInsight[] {
  const insights: AISentinelInsight[] = [];
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentMonthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const dayOfMonth = now.getDate();
  const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const monthProgressRatio = dayOfMonth / totalDaysInMonth; // e.g. 0.5 if mid-month

  // Sadece aktif işletmeleri denetle
  const activeClients = isletmeler.filter((b) => b.active);

  activeClients.forEach((client) => {
    const clientName = client.name;
    const reelsTarget = client.monthlyReelsTarget || 8; // varsayılan: 8 Reels/ay
    const shootTarget = client.monthlyShootTarget || 2; // varsayılan: 2 Çekim/ay

    // 1. Bu ayki yayınlanmış / planlanmış içerikler
    const clientPostsThisMonth = takvimPosts.filter(
      (p) => p.client === clientName && p.date.startsWith(currentMonthStr)
    );

    const publishedOrScheduled = clientPostsThisMonth.filter((p) =>
      ['published', 'scheduled', 'ready'].includes(p.status)
    );

    // 2. Son içerik paylaşım tarihi (geçmiş gönderiler)
    const pastPosts = takvimPosts
      .filter((p) => p.client === clientName && p.date <= todayStr)
      .sort((a, b) => b.date.localeCompare(a.date));

    let daysSinceLastPost = 0;
    if (pastPosts.length > 0) {
      const lastPostDate = new Date(pastPosts[0].date);
      const diffTime = Math.abs(now.getTime() - lastPostDate.getTime());
      daysSinceLastPost = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      daysSinceLastPost = 7; // Gönderi yoksa 7 gün kabul et
    }

    // ── UYARI 1: İçerik Arası Çok Açıldı (4+ gündür içerik yok) ──
    if (daysSinceLastPost >= 4) {
      insights.push({
        id: `delay-${client.id}`,
        client: clientName,
        type: 'delay',
        severity: daysSinceLastPost >= 6 ? 'high' : 'medium',
        title: `⚠️ ${clientName} için ${daysSinceLastPost} gündür içerik paylaşılmadı!`,
        description: `Sözleşme gereği ortalama 3 güne bir içerik girmemiz gerekiyor. Sayfa akışı soğuyor.`,
        daysSinceLastPost,
        actionHref: '/paylasim-takvimi',
        actionText: 'Paylaşım Planla',
      });
    }

    // ── UYARI 2: Aylık Kota Gerisinde Kalındı ──
    const targetPace = Math.round(reelsTarget * monthProgressRatio);
    if (dayOfMonth >= 10 && publishedOrScheduled.length < targetPace) {
      const missingCount = targetPace - publishedOrScheduled.length;
      insights.push({
        id: `quota-${client.id}`,
        client: clientName,
        type: 'quota_lag',
        severity: missingCount >= 3 ? 'high' : 'medium',
        title: `📊 ${clientName} hedeflenen kotanın ${missingCount} içerik gerisinde!`,
        description: `Ayın %${Math.round(monthProgressRatio * 100)}'i bitti (${dayOfMonth}/${totalDaysInMonth}. gün). Hedef: ${reelsTarget} Reels, Mevcut: ${publishedOrScheduled.length}.`,
        completedQuota: publishedOrScheduled.length,
        targetQuota: reelsTarget,
        actionHref: '/editler',
        actionText: 'Editlere Git',
      });
    }

    // ── UYARI 3: Çekim Kotası & Rotası Uyarısı ──
    const shootsThisMonth = cekimler.filter(
      (c) => c.client === clientName && c.date.startsWith(currentMonthStr)
    );

    if (dayOfMonth >= 12 && shootsThisMonth.length < shootTarget) {
      insights.push({
        id: `shoot-${client.id}`,
        client: clientName,
        type: 'shoot_missing',
        severity: dayOfMonth >= 20 ? 'high' : 'medium',
        title: `🎬 ${clientName} için çekim rotası eksik!`,
        description: `Aylık ${shootTarget} çekim sözleşmesi var, şu ana kadar ${shootsThisMonth.length} çekim girildi. Rotaya eklenmeli.`,
        actionHref: '/cekimler',
        actionText: 'Çekim Ekle',
      });
    }

    // ── UYARI 4: Hazır Edit Stok Tükeniyor ──
    const clientEdits = editler.filter((e) => e.client === clientName);
    const readyEdits = clientEdits.filter((e) => e.status === 'ready');
    const waitingEdits = clientEdits.filter((e) => e.status === 'editing' || e.status === 'waiting');

    if (readyEdits.length === 0 && waitingEdits.length > 0) {
      insights.push({
        id: `stock-${client.id}`,
        client: clientName,
        type: 'stock_empty',
        severity: 'medium',
        title: `🎞️ ${clientName} için stokta onaylı edit kalmadı!`,
        description: `Kurguda/bekleyen ${waitingEdits.length} adet video var. Bugün 1 tanesini onaylayıp stoka almalıyız.`,
        actionHref: '/editler',
        actionText: 'Editleri İncele',
      });
    }
  });

  // Öncelik sırasına göre sırala: high > medium > low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  return insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
