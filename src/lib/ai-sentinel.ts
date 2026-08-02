import { Isletme, Cekim, EditItem, TakvimPost, Gelir } from '@/types/app';
import { isClientMatch } from '@/lib/helpers';

export interface AISentinelInsight {
  id: string;
  client: string;
  type: 'delay' | 'quota_lag' | 'stock_empty' | 'shoot_missing' | 'payment_overdue';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  daysSinceLastPost?: number;
  completedQuota?: number;
  targetQuota?: number;
  actionHref?: string;
  actionText?: string;
}

export interface ClientAIReport {
  id: string;
  name: string;
  active: boolean;
  reelsTarget: number;
  reelsRealized: number;
  shootTarget: number;
  shootRealized: number;
  postGapMax: number;
  daysSinceLastPost: number;
  readyEditsStock: number;
  healthScore: number; // 0 - 100%
  status: 'excellent' | 'warning' | 'critical';
  insights: AISentinelInsight[];
}

export function runAISentinelAudit({
  isletmeler,
  cekimler,
  editler,
  takvimPosts,
  gelirler = [],
}: {
  isletmeler: Isletme[];
  cekimler: Cekim[];
  editler: EditItem[];
  takvimPosts: TakvimPost[];
  gelirler?: Gelir[];
}): {
  insights: AISentinelInsight[];
  clientReports: ClientAIReport[];
  agencyHealthScore: number;
} {
  const insights: AISentinelInsight[] = [];
  const clientReports: ClientAIReport[] = [];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentMonthStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`;
  const dayOfMonth = now.getDate();
  const totalDaysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const monthProgressRatio = dayOfMonth / totalDaysInMonth;

  // Sadece aktif işletmeleri denetle
  const activeClients = isletmeler.filter((b) => b.active);

  activeClients.forEach((client) => {
    const clientName = client.name;
    const reelsTarget = Number(client.monthlyReelsTarget) || 8;
    const shootTarget = Number(client.monthlyShootTarget) || 2;
    const maxGap = Number(client.maxDaysBetweenPosts) || 3;

    // 1. Bu ayki yayınlanmış / planlanmış içerikler (isClientMatch ile esnek eşleme)
    const clientPostsThisMonth = takvimPosts.filter(
      (p) => isClientMatch(p.client, clientName) && p.date.startsWith(currentMonthStr)
    );

    const publishedOrScheduled = clientPostsThisMonth.filter((p) =>
      ['published', 'scheduled', 'ready'].includes(p.status)
    );

    // 2. Son içerik paylaşım tarihi (geçmiş gönderiler)
    const pastPosts = takvimPosts
      .filter((p) => isClientMatch(p.client, clientName) && p.date <= todayStr)
      .sort((a, b) => b.date.localeCompare(a.date));

    let daysSinceLastPost = 0;
    if (pastPosts.length > 0) {
      const lastPostDate = new Date(pastPosts[0].date);
      const diffTime = Math.abs(now.getTime() - lastPostDate.getTime());
      daysSinceLastPost = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } else {
      daysSinceLastPost = Math.min(dayOfMonth, 7);
    }

    // 3. Bu ayki çekimler
    const shootsThisMonth = cekimler.filter(
      (c) => isClientMatch(c.client, clientName) && (c.date.startsWith(currentMonthStr) || c.status === 'completed')
    );

    // 4. Kurgu stokları
    const clientEdits = editler.filter((e) => isClientMatch(e.client, clientName));
    const readyEdits = clientEdits.filter((e) => e.status === 'ready' || e.status === 'published');
    const waitingEdits = clientEdits.filter((e) => e.status === 'editing' || e.status === 'waiting');

    // 5. Müşteri bazlı özel insight/uyarı üretimi
    const clientInsights: AISentinelInsight[] = [];

    // UYARI 1: İçerik Arası Açıldı
    if (daysSinceLastPost > maxGap) {
      const ins: AISentinelInsight = {
        id: `delay-${client.id}`,
        client: clientName,
        type: 'delay',
        severity: daysSinceLastPost >= maxGap + 2 ? 'high' : 'medium',
        title: `⚠️ ${clientName} için ${daysSinceLastPost} gündür içerik paylaşılmadı!`,
        description: `Müşteri paketi kuralına göre ${maxGap} günde bir paylaşım yapılması gerekiyor. İzin verilen aralık aşıldı.`,
        daysSinceLastPost,
        actionHref: '/paylasim-takvimi',
        actionText: 'Paylaşım Planla',
      };
      clientInsights.push(ins);
      insights.push(ins);
    }

    // UYARI 2: Aylık Kota Gerisinde Kalındı
    const targetPace = Math.round(reelsTarget * monthProgressRatio);
    if (dayOfMonth >= 5 && publishedOrScheduled.length < targetPace) {
      const missingCount = targetPace - publishedOrScheduled.length;
      const ins: AISentinelInsight = {
        id: `quota-${client.id}`,
        client: clientName,
        type: 'quota_lag',
        severity: missingCount >= 3 ? 'high' : 'medium',
        title: `📊 ${clientName} hedeflenen Reels kotasının ${missingCount} içerik gerisinde!`,
        description: `Ayın ${dayOfMonth}/${totalDaysInMonth}. günündeyiz (%${Math.round(monthProgressRatio * 100)}). Hedef: ${reelsTarget} Reels, Mevcut: ${publishedOrScheduled.length}.`,
        completedQuota: publishedOrScheduled.length,
        targetQuota: reelsTarget,
        actionHref: '/editler',
        actionText: 'Editlere Git',
      };
      clientInsights.push(ins);
      insights.push(ins);
    }

    // UYARI 3: Çekim Kotası Eksik
    if (dayOfMonth >= 10 && shootsThisMonth.length < shootTarget) {
      const ins: AISentinelInsight = {
        id: `shoot-${client.id}`,
        client: clientName,
        type: 'shoot_missing',
        severity: dayOfMonth >= 20 ? 'high' : 'medium',
        title: `🎬 ${clientName} için çekim kotası eksik!`,
        description: `Aylık ${shootTarget} çekim hedefi var, şu ana kadar ${shootsThisMonth.length} çekim girildi. Rotaya eklenmeli.`,
        actionHref: '/cekimler',
        actionText: 'Çekim Ekle',
      };
      clientInsights.push(ins);
      insights.push(ins);
    }

    // UYARI 4: Stok Tükeniyor
    if (readyEdits.length === 0 && waitingEdits.length > 0) {
      const ins: AISentinelInsight = {
        id: `stock-${client.id}`,
        client: clientName,
        type: 'stock_empty',
        severity: 'medium',
        title: `🎞️ ${clientName} için stokta onaylı edit kalmadı!`,
        description: `Kurguda ${waitingEdits.length} adet video var. Bugün 1 tanesini onaylayıp stoka almalısınız.`,
        actionHref: '/editler',
        actionText: 'Editleri İncele',
      };
      clientInsights.push(ins);
      insights.push(ins);
    }

    // Müşteri Sağlık Skoru Hesaplama (100 üzerinden)
    let score = 100;
    if (daysSinceLastPost > maxGap) score -= 25;
    if (publishedOrScheduled.length < targetPace) score -= 25;
    if (shootsThisMonth.length < shootTarget && dayOfMonth >= 10) score -= 20;
    if (readyEdits.length === 0) score -= 15;
    const finalScore = Math.max(score, 10);

    clientReports.push({
      id: client.id,
      name: clientName,
      active: true,
      reelsTarget,
      reelsRealized: publishedOrScheduled.length,
      shootTarget,
      shootRealized: shootsThisMonth.length,
      postGapMax: maxGap,
      daysSinceLastPost,
      readyEditsStock: readyEdits.length,
      healthScore: finalScore,
      status: finalScore >= 80 ? 'excellent' : finalScore >= 50 ? 'warning' : 'critical',
      insights: clientInsights,
    });
  });

  // Genel Ajans Sağlık Skoru
  const totalScore = clientReports.reduce((acc, c) => acc + c.healthScore, 0);
  const agencyHealthScore = clientReports.length > 0 ? Math.round(totalScore / clientReports.length) : 100;

  // Öncelik sırasına göre sırala
  const severityOrder = { high: 0, medium: 1, low: 2 };
  const sortedInsights = insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    insights: sortedInsights,
    clientReports,
    agencyHealthScore,
  };
}
