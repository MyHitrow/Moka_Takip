'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building2,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useData } from '@/context/data-context';

export default function RaporlarPage() {
  const { gelirler, giderler, isletmeler, cekimler, editler, updateEditStatus, addGelir, deleteGelir } = useData();
  const [timeFilter, setTimeFilter] = useState<'all' | 'year' | 'month' | 'week'>('month');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Filter income and expenses based on time filter
  const filterByDate = (dateStr: string) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;

    if (timeFilter === 'month') {
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }
    if (timeFilter === 'year') {
      return d.getFullYear() === currentYear;
    }
    if (timeFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= oneWeekAgo && d <= now;
    }
    return true; // 'all'
  };

  const filteredGelirler = gelirler.filter((g) => filterByDate(g.date));
  const filteredGiderler = giderler.filter((g) => filterByDate(g.date));

  const totalExpectedIncome = filteredGelirler.reduce((sum, item) => sum + item.amount, 0);
  const totalCollectedIncome = filteredGelirler
    .filter((g) => g.status === 'paid')
    .reduce((sum, item) => sum + item.amount, 0);
  const totalOverdueIncome = filteredGelirler
    .filter((g) => g.status === 'overdue' || g.status === 'pending')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = filteredGiderler.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalCollectedIncome - totalExpense;

  const collectionRate = totalExpectedIncome > 0
    ? Math.round((totalCollectedIncome / totalExpectedIncome) * 100)
    : 0;

  // Uncollected customers (Ödeme günleri ayın ilk haftası — alamayanlar kırmızı)
  const uncollectedGelirler = gelirler.filter(
    (g) => g.status === 'overdue' || g.status === 'pending'
  );

  const markAsPaid = (gelirId: string) => {
    const item = gelirler.find((g) => g.id === gelirId);
    if (item) {
      deleteGelir(gelirId);
      addGelir({
        ...item,
        status: 'paid',
      });
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <Header title="Raporlar" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Raporlar"
          subtitle="Finansal analiz ve müşteri ödeme durumları"
          icon={BarChart3}
        />

        {/* Time Filter Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-muted-foreground mr-2">Zaman Filtresi:</span>
            <Button
              variant={timeFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('week')}
            >
              Haftalık
            </Button>
            <Button
              variant={timeFilter === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('month')}
            >
              Aylık
            </Button>
            <Button
              variant={timeFilter === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('year')}
            >
              Yıllık
            </Button>
            <Button
              variant={timeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeFilter('all')}
            >
              Tüm Zamanlar
            </Button>
          </div>

          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1 bg-muted px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {timeFilter === 'month' && 'Bu Ayın Verileri Gösteriliyor'}
              {timeFilter === 'week' && 'Son 7 Günün Verileri Gösteriliyor'}
              {timeFilter === 'year' && 'Bu Yılın Verileri Gösteriliyor'}
              {timeFilter === 'all' && 'Tüm Dönem Verileri Gösteriliyor'}
            </span>
          </div>
        </div>

        {/* Highlighted Warning Section for Overdue/Uncollected Payments (KIRMIZI ALARM KUTUSU) */}
        {uncollectedGelirler.length > 0 && (
          <div className="mt-6 bg-red-500/10 border-2 border-red-500/30 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-500 text-white p-2 rounded-lg animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-500 text-lg">
                  Ödemesi Alınamayan Müşteriler (Ayın İlk Haftası Vadesi)
                </h3>
                <p className="text-xs text-red-400">
                  Aşağıdaki {uncollectedGelirler.length} müşterinin ödemesi ayın ilk haftası vadesi geçmesine rağmen henüz tahsil edilmedi!
                </p>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-red-500/20 text-red-300">
                  <tr>
                    <th className="px-4 py-2 rounded-l">Müşteri / İşletme</th>
                    <th className="px-4 py-2">Açıklama</th>
                    <th className="px-4 py-2">Tutar</th>
                    <th className="px-4 py-2">Vade Tarihi</th>
                    <th className="px-4 py-2">Durum</th>
                    <th className="px-4 py-2 text-right rounded-r">Hızlı İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-red-500/20">
                  {uncollectedGelirler.map((item) => (
                    <tr key={item.id} className="bg-red-950/20 hover:bg-red-900/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-red-200 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-red-400" />
                        {item.client}
                      </td>
                      <td className="px-4 py-3 text-red-300 text-xs">{item.description}</td>
                      <td className="px-4 py-3 font-bold text-red-100">{formatCurrency(item.amount)}</td>
                      <td className="px-4 py-3 text-red-300 text-xs font-mono">{item.date}</td>
                      <td className="px-4 py-3">
                        <Badge className="bg-red-600/30 text-red-300 border border-red-500/40">
                          {item.status === 'overdue' ? 'Gecikti!' : 'Ödeme Bekliyor'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          onClick={() => markAsPaid(item.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Tahsil Edildi Yap
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Financial Stat Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Tahsil Edilen Gelir</span>
              <div className="bg-emerald-500/10 p-2 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(totalCollectedIncome)}</h3>
            <p className="text-xs text-muted-foreground mt-2">
              Beklenen: <span className="font-semibold text-foreground">{formatCurrency(totalExpectedIncome)}</span>
            </p>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Toplam Gider</span>
              <div className="bg-amber-500/10 p-2 rounded-lg">
                <ArrowDownRight className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">{formatCurrency(totalExpense)}</h3>
            <p className="text-xs text-muted-foreground mt-2">{filteredGiderler.length} harcama kalemi</p>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Net Kâr / Bakiye</span>
              <div className={netProfit >= 0 ? "bg-blue-500/10 p-2 rounded-lg" : "bg-red-500/10 p-2 rounded-lg"}>
                <Wallet className={netProfit >= 0 ? "w-5 h-5 text-blue-500" : "w-5 h-5 text-red-500"} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatCurrency(netProfit)}
            </h3>
            <p className="text-xs text-muted-foreground mt-2">Tahsil Edilen - Giderler</p>
          </Card>

          <Card className="p-5 bg-card border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Tahsilat Başarı Oranı</span>
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground">%{collectionRate}</h3>
            <div className="w-full bg-muted h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(collectionRate, 100)}%` }}
              />
            </div>
          </Card>
        </div>

        {/* Operational Overview Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Businesses & Payment Status */}
          <Card className="p-6 bg-card border border-border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" /> Müşteri Ödeme Performansı
            </h3>
            <div className="space-y-3">
              {isletmeler.map((biz) => {
                const bizGelirler = gelirler.filter((g) => g.client === biz.name);
                const hasUnpaid = bizGelirler.some((g) => g.status === 'overdue' || g.status === 'pending');
                const totalBizPaid = bizGelirler.filter((g) => g.status === 'paid').reduce((acc, c) => acc + c.amount, 0);

                return (
                  <div
                    key={biz.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      hasUnpaid
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-emerald-500/10 border-emerald-500/20'
                    }`}
                  >
                    <div>
                      <h4 className="font-semibold text-sm">{biz.name}</h4>
                      <p className="text-xs text-muted-foreground">Aylık Anlaşma: {biz.fee}</p>
                    </div>

                    <div className="text-right">
                      {hasUnpaid ? (
                        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                          Ödeme Alamadık!
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Ödemeler Tamam
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Ödenen: <span className="font-medium text-foreground">{formatCurrency(totalBizPaid)}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Operational Metrics */}
          <Card className="p-6 bg-card border border-border flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" /> Operasyonel İstatistikler
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/40 p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Toplam Çekim</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{cekimler.length}</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Toplam Edit Görevi</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{editler.length}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Aylık Otomatik Ödeme Takibi</p>
                <p className="text-xs text-muted-foreground">
                  Ödemeler her ayın ilk haftasında otomatik kontrol edilir ve gecikenler kırmızı ile vurgulanır.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
