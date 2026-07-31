'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  BarChart3, TrendingUp, TrendingDown, Wallet,
  AlertTriangle, CheckCircle, Building2, PieChartIcon,
  ArrowUpRight, ArrowDownRight, Calendar, Target,
  CreditCard, Package, Film, Clock,
} from 'lucide-react';
import { useData } from '@/context/data-context';

// ─── Sabitler ───────────────────────────────────────────────────────────────

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const COLORS_PIE = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

const formatCurrencyShort = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ₺`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K ₺`;
  return `${val} ₺`;
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  title, value, sub, icon: Icon, color, trend,
}: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: { val: number; label: string };
}) {
  return (
    <Card className="p-5 bg-card border-border relative overflow-hidden group hover:border-primary/40 transition-all duration-300">
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${color.replace('text-', 'bg-').replace('-500', '-500/5')}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{title}</span>
          <div className={`p-2 rounded-xl ${color.replace('text-', 'bg-').replace('-500', '-500/15')}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
        </div>
        <p className="text-2xl font-extrabold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend.val >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.val >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend.val)}% {trend.label}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Ana Sayfa ───────────────────────────────────────────────────────────────

type FilterType = 'month' | 'quarter' | 'year' | 'all';

export default function RaporlarPage() {
  const { gelirler, giderler, isletmeler, cekimler, editler, updateGelirStatus } = useData();
  const [timeFilter, setTimeFilter] = useState<FilterType>('year');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // ─── Filtre ─────────────────────────────────────────────────────────────────

  const filterByDate = (dateStr: string) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    if (timeFilter === 'month') return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    if (timeFilter === 'quarter') {
      const q = Math.floor(currentMonth / 3);
      return d.getFullYear() === currentYear && Math.floor(d.getMonth() / 3) === q;
    }
    if (timeFilter === 'year') return d.getFullYear() === currentYear;
    return true;
  };

  const filteredGelirler = gelirler.filter((g) => filterByDate(g.date));
  const filteredGiderler = giderler.filter((g) => filterByDate(g.date));

  // ─── Temel Metrikler ────────────────────────────────────────────────────────

  const totalExpected = filteredGelirler.reduce((s, g) => s + g.amount, 0);
  const totalCollected = filteredGelirler
    .filter((g) => g.status === 'paid')
    .reduce((s, g) => s + g.amount, 0);
  const totalPartial = filteredGelirler
    .reduce((s, g) => s + (g.paidAmount || 0), 0);
  const totalExpense = filteredGiderler.reduce((s, g) => s + g.amount, 0);
  const netProfit = totalCollected + totalPartial - totalExpense;
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
  const overdueTotal = filteredGelirler
    .filter((g) => g.status !== 'paid')
    .reduce((s, g) => s + (g.amount - (g.paidAmount || 0)), 0);

  // ─── Aylık Trend Verisi ─────────────────────────────────────────────────────

  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: MONTHS_TR[i],
      month: i,
      gelir: 0,
      gider: 0,
      kar: 0,
    }));

    gelirler.forEach((g) => {
      const d = new Date(g.date);
      if (d.getFullYear() === currentYear && g.status === 'paid') {
        months[d.getMonth()].gelir += g.amount;
      }
    });

    giderler.forEach((g) => {
      const d = new Date(g.date);
      if (d.getFullYear() === currentYear) {
        months[d.getMonth()].gider += g.amount;
      }
    });

    months.forEach((m) => { m.kar = m.gelir - m.gider; });

    return months;
  }, [gelirler, giderler, currentYear]);

  // ─── Gider Kategorileri ─────────────────────────────────────────────────────

  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    const catLabels: Record<string, string> = {
      personnel: 'Personel', transportation: 'Ulaşım', food: 'Yemek',
      equipment: 'Ekipman', software: 'Yazılım', advertising: 'Reklam',
      office: 'Ofis', tax: 'Vergi', freelance: 'Freelance', other: 'Diğer',
    };
    filteredGiderler.forEach((g) => {
      const label = catLabels[g.category] || g.category;
      map[label] = (map[label] || 0) + g.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredGiderler]);

  // ─── Müşteri Bazlı Gelir ────────────────────────────────────────────────────

  const clientRevenue = useMemo(() => {
    const map: Record<string, { collected: number; pending: number }> = {};
    filteredGelirler.forEach((g) => {
      if (!map[g.client]) map[g.client] = { collected: 0, pending: 0 };
      if (g.status === 'paid') map[g.client].collected += g.amount;
      else map[g.client].pending += g.amount - (g.paidAmount || 0);
    });
    return Object.entries(map)
      .map(([name, v]) => ({ name, ...v, total: v.collected + v.pending }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [filteredGelirler]);

  // ─── Edit Durumu Dağılımı ────────────────────────────────────────────────────

  const editStatusData = useMemo(() => [
    { name: 'Bekleyen', value: editler.filter((e) => e.status === 'waiting').length, color: '#6b7280' },
    { name: 'Kurguda', value: editler.filter((e) => e.status === 'editing').length, color: '#3b82f6' },
    { name: 'Müşteri Onayı', value: editler.filter((e) => e.status === 'client_review').length, color: '#f59e0b' },
    { name: 'Hazır/Yayında', value: editler.filter((e) => ['ready', 'published'].includes(e.status)).length, color: '#22c55e' },
  ].filter((d) => d.value > 0), [editler]);

  // ─── Tahsilat Bekleyenler ─────────────────────────────────────────────────────

  const overdueList = gelirler.filter((g) => g.status !== 'paid').slice(0, 10);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'Bu Ay', value: 'month' },
    { label: 'Bu Çeyrek', value: 'quarter' },
    { label: 'Bu Yıl', value: 'year' },
    { label: 'Tüm Zamanlar', value: 'all' },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Raporlar & Analiz"
        subtitle="Finansal performans, trend analizi ve operasyonel özet"
        icon={BarChart3}
      />

      {/* Filtre Barı */}
      <div className="flex flex-wrap items-center gap-2 bg-card border border-border p-3 rounded-2xl">
        <Calendar className="w-4 h-4 text-muted-foreground ml-1" />
        <span className="text-xs text-muted-foreground font-medium mr-1">Dönem:</span>
        {filterButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={timeFilter === btn.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTimeFilter(btn.value)}
            className={timeFilter === btn.value ? 'h-7 text-xs' : 'h-7 text-xs text-muted-foreground'}
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {/* ── KPI Kartları ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tahsil Edilen" value={formatCurrency(totalCollected)} sub={`Beklenen: ${formatCurrency(totalExpected)}`} icon={TrendingUp} color="text-emerald-500" />
        <StatCard title="Toplam Gider" value={formatCurrency(totalExpense)} sub={`${filteredGiderler.length} kalem`} icon={TrendingDown} color="text-amber-500" />
        <StatCard title="Net Kâr / Bakiye" value={formatCurrency(netProfit)} sub="Tahsilat - Gider" icon={Wallet} color={netProfit >= 0 ? 'text-blue-400' : 'text-red-400'} />
        <StatCard title="Tahsilat Oranı" value={`%${collectionRate}`} sub={`Geciken: ${formatCurrency(overdueTotal)}`} icon={Target} color="text-purple-500" />
      </div>

      {/* ── Operasyonel Kartlar ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Aktif Müşteri" value={isletmeler.filter((i) => i.active).length} icon={Building2} color="text-primary" />
        <StatCard title="Toplam Çekim" value={cekimler.length} sub={`${cekimler.filter((c) => c.status === 'planned').length} planlı`} icon={Film} color="text-sky-500" />
        <StatCard title="Aktif Edit" value={editler.filter((e) => !['ready', 'published'].includes(e.status)).length} sub={`${editler.length} toplam`} icon={Package} color="text-violet-500" />
        <StatCard title="Bekleyen Ödeme" value={formatCurrency(overdueTotal)} sub={`${overdueList.length} kayıt`} icon={CreditCard} color="text-red-500" />
      </div>

      {/* ── Gelir-Gider-Kâr Aylık Trend ── */}
      <Card className="p-6 bg-card border-border">
        <h3 className="font-bold text-base mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> {currentYear} Yılı Aylık Gelir / Gider / Kâr Trendi
        </h3>
        <p className="text-xs text-muted-foreground mb-5">Tahsil edilen gelir, gider ve net kâr karşılaştırması</p>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradGelir" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradGider" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradKar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatCurrencyShort} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af', paddingTop: 8 }} />
            <Area type="monotone" dataKey="gelir" name="Gelir" stroke="#22c55e" strokeWidth={2} fill="url(#gradGelir)" dot={{ fill: '#22c55e', r: 3 }} />
            <Area type="monotone" dataKey="gider" name="Gider" stroke="#f97316" strokeWidth={2} fill="url(#gradGider)" dot={{ fill: '#f97316', r: 3 }} />
            <Area type="monotone" dataKey="kar" name="Net Kâr" stroke="#3b82f6" strokeWidth={2} fill="url(#gradKar)" dot={{ fill: '#3b82f6', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Orta Satır: Müşteri Geliri + Gider Dağılımı ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Müşteri Bazlı Gelir */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-bold text-base mb-1 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Müşteri Bazlı Gelir Analizi
          </h3>
          <p className="text-xs text-muted-foreground mb-5">Tahsil edilen ve bekleyen tutarlar</p>
          {clientRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={clientRevenue} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tickFormatter={formatCurrencyShort} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
                <Bar dataKey="collected" name="Tahsil Edilen" fill="#22c55e" radius={[0, 4, 4, 0]} />
                <Bar dataKey="pending" name="Bekleyen" fill="#ef444460" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">Veri yok</div>
          )}
        </Card>

        {/* Gider Kategorileri Pie */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-bold text-base mb-1 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" /> Gider Dağılımı
          </h3>
          <p className="text-xs text-muted-foreground mb-5">Kategoriye göre harcamalar</p>
          {expenseByCategory.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" paddingAngle={3} stroke="none">
                    {expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {expenseByCategory.slice(0, 6).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS_PIE[i % COLORS_PIE.length] }} />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{formatCurrencyShort(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">Veri yok</div>
          )}
        </Card>
      </div>

      {/* ── Alt Satır: Edit Durumu + Tahsilat Bekleyenler ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Edit Durumu Pie */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-bold text-base mb-1 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> Edit / Kurgu Durumu
          </h3>
          <p className="text-xs text-muted-foreground mb-5">Mevcut edit görevlerinin dağılımı</p>
          {editStatusData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={editStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                    dataKey="value" paddingAngle={4} stroke="none">
                    {editStatusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {editStatusData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-muted-foreground">{d.name}</span>
                    </div>
                    <Badge className="text-xs font-bold" style={{ background: `${d.color}20`, color: d.color, border: `1px solid ${d.color}40` }}>
                      {d.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">Edit yok</div>
          )}
        </Card>

        {/* Tahsilat Bekleyenler */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Tahsilat Bekleyenler</span>
            {overdueList.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs ml-auto">
                {overdueList.length} kayıt
              </Badge>
            )}
          </h3>
          {overdueList.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {overdueList.map((item) => (
                <div key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-red-500/8 border border-red-500/20 hover:border-red-500/40 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate">{item.client}</p>
                    <p className="text-xs text-muted-foreground">Vade: {item.date}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className="font-bold text-sm text-red-300">{formatCurrency(item.amount - (item.paidAmount || 0))}</span>
                    <Button
                      size="sm"
                      onClick={() => updateGelirStatus(item.id, 'paid')}
                      className="h-7 text-xs bg-emerald-600/80 hover:bg-emerald-600 text-white px-2"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Tahsil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] gap-3 text-muted-foreground">
              <CheckCircle className="w-10 h-10 text-emerald-500/40" />
              <p className="text-sm font-medium">Bekleyen tahsilat yok 🎉</p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Tahsilat Oranı Progress Bar ── */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" /> Genel Tahsilat Performansı
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Seçili dönem için beklenen vs gerçekleşen</p>
          </div>
          <span className="text-3xl font-extrabold text-primary">%{collectionRate}</span>
        </div>
        <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(collectionRate, 100)}%`,
              background: collectionRate >= 80
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : collectionRate >= 50
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #ef4444, #dc2626)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Tahsil Edilen: <strong className="text-emerald-400">{formatCurrency(totalCollected)}</strong></span>
          <span>Beklenen Toplam: <strong className="text-foreground">{formatCurrency(totalExpected)}</strong></span>
        </div>
      </Card>
    </div>
  );
}
