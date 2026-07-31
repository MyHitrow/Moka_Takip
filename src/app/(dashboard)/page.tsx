'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { AiSentinelWidget } from '@/components/dashboard/ai-sentinel-widget';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeekShoots } from '@/components/dashboard/week-shoots';
import { EditorWorkload } from '@/components/dashboard/editor-workload';
import { HaftalikNotlar } from '@/components/dashboard/haftalik-notlar';
import { useData, Gelir } from '@/context/data-context';
import { Button } from '@/components/ui/button';

import {
  Camera,
  Video,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Eye,
  CalendarClock,
  ArrowRight,
  PieChart
} from 'lucide-react';

const MONTHS_TR = [
  { key: '01', name: 'Ocak' },
  { key: '02', name: 'Şubat' },
  { key: '03', name: 'Mart' },
  { key: '04', name: 'Nisan' },
  { key: '05', name: 'Mayıs' },
  { key: '06', name: 'Haziran' },
  { key: '07', name: 'Temmuz' },
  { key: '08', name: 'Ağustos' },
  { key: '09', name: 'Eylül' },
  { key: '10', name: 'Ekim' },
  { key: '11', name: 'Kasım' },
  { key: '12', name: 'Aralık' },
];

export default function DashboardPage() {
  const { cekimler, editler, gelirler, giderler, currentUser } = useData();

  const now = new Date();
  let activeMonthIndex = now.getMonth(); // 0-11
  let activeYear = now.getFullYear();

  // Rule: Starting on the 27th day of the month, active period automatically advances to NEXT MONTH!
  if (now.getDate() >= 27) {
    activeMonthIndex += 1;
    if (activeMonthIndex > 11) {
      activeMonthIndex = 0;
      activeYear += 1;
    }
  }

  const activeMonthKey = String(activeMonthIndex + 1).padStart(2, '0');
  const activeMonthName = MONTHS_TR.find((m) => m.key === activeMonthKey)?.name || '';
  const activePeriodStr = `${activeYear}-${activeMonthKey}`;

  const currentDate = now.toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const todayStr = now.toISOString().split('T')[0];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  // Helper to calculate exact status matching Gelirler page logic
  const getItemStatus = (income: Gelir) => {
    if (income.status === 'paid') return 'paid';
    if (income.status === 'partial' || (income.paidAmount && income.paidAmount > 0 && income.paidAmount < income.amount)) {
      return 'partial';
    }

    const parts = income.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;

      const currentYear = now.getFullYear();
      const currentMonthIndex = now.getMonth();
      const currentDay = now.getDate();

      // Past months -> Always RED Gecikti!
      if (year < currentYear || (year === currentYear && monthIndex < currentMonthIndex)) {
        return 'overdue';
      }

      // Current month:
      if (year === currentYear && monthIndex === currentMonthIndex) {
        if (currentDay > 7) {
          return 'overdue';
        }
        return 'pending';
      }

      return 'pending';
    }

    return income.status;
  };

  // Active Month Incomes
  const activeGelirler = gelirler.filter((g) => g.date.startsWith(activePeriodStr));

  // 1. Total Expected Anlaşma
  const totalExpectedIncome = activeGelirler.reduce((acc, curr) => acc + curr.amount, 0);

  // 2. Full Paid Incomes
  const totalPaidFull = activeGelirler
    .filter((g) => g.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Partial Amount Collected
  const totalPartialPaid = activeGelirler
    .reduce((acc, curr) => {
      if (curr.status === 'partial' || (curr.paidAmount && curr.paidAmount > 0 && curr.status !== 'paid')) {
        return acc + (curr.paidAmount || 0);
      }
      return acc;
    }, 0);

  // Total Collected (Full + Partial)
  const totalCollectedSoFar = totalPaidFull + totalPartialPaid;

  // 4. Overdue Remaining Balance (Day 8+)
  const totalOverdueIncome = activeGelirler
    .filter((g) => g.status !== 'paid' && getItemStatus(g) === 'overdue')
    .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);

  // Active Month Expenses
  const activeGiderler = giderler.filter((e) => e.date.startsWith(activePeriodStr));
  const totalExpenses = activeGiderler.length > 0
    ? activeGiderler.reduce((acc, curr) => acc + curr.amount, 0)
    : giderler.reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalCollectedSoFar - totalExpenses;

  const waitingEdits = editler.filter((e) => e.status === 'waiting').length;
  const inProgressEdits = editler.filter((e) => e.status === 'editing').length;
  const clientReviewEdits = editler.filter((e) => e.status === 'client_review').length;
  const readyEdits = editler.filter((e) => e.status === 'ready' || e.status === 'published').length;

  // Filter edits that are due today or overdue and not completed
  const dueTodayEdits = editler.filter((e) => {
    const isPending = e.status !== 'ready' && e.status !== 'published';
    const isDue = e.deadline === todayStr || e.deadline <= todayStr;
    const isMyTask =
      currentUser.role === 'super_admin' ||
      currentUser.role === 'admin' ||
      e.editor.toLowerCase().includes(currentUser.name.toLowerCase()) ||
      currentUser.name.toLowerCase().includes(e.editor.toLowerCase());

    return isPending && isDue && isMyTask;
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-0 md:pt-6">
      <Header title="Dashboard" subtitle="Genel bakış ve bugünün görevleri" />

      {/* HIGH PRIORITY EXCLAMATION ALERT BANNER FOR EDITS DUE TODAY */}
      {dueTodayEdits.length > 0 && (
        <div className="p-4 bg-red-500/15 border-2 border-red-500/50 text-red-300 rounded-2xl red-glow animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500 text-white rounded-xl font-extrabold text-xl shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                ⚠️ BUGÜN YAPILMASI GEREKEN ({dueTodayEdits.length}) ADET EDİT VAR!
              </h3>
              <p className="text-xs text-red-200 mt-0.5 font-medium">
                {dueTodayEdits.map((e) => `${e.client} (${e.title})`).join(' • ')}
              </p>
            </div>
          </div>
          <Link href="/editler">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-extrabold shrink-0">
              Editlere Git <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      <PageHeader
        title={`Dashboard — Hoşgeldiniz, ${currentUser.name}`}
        subtitle={currentDate}
      />

      {/* 🤖 AI DİREKTÖR BEKÇİSİ (SENTINEL) WIDGET */}
      <AiSentinelWidget />

      <div className="space-y-8">
        {/* Çekimler Section */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold mt-0">Çekim Durumu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Toplam Çekim"
              value={cekimler.length}
              icon={Camera}
              href="/cekimler"
              color="info"
            />
            <StatCard
              title="Planlanan Çekimler"
              value={cekimler.filter((c) => c.status === 'planned' || c.status === 'ready').length}
              icon={Clock}
              href="/cekimler"
              color="warning"
            />
          </div>
        </section>

        {/* Editler Section */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold mt-8">Edit Durumu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Kurgu Bekleyen"
              value={waitingEdits}
              icon={CalendarClock}
              href="/editler"
              color="default"
            />
            <StatCard
              title="Kurguda"
              value={inProgressEdits}
              icon={Video}
              href="/editler"
              color="info"
            />
            <StatCard
              title="Müşteri Onayında"
              value={clientReviewEdits}
              icon={Eye}
              href="/editler"
              color="warning"
            />
            <StatCard
              title="Biten / Hazır"
              value={readyEdits}
              icon={CheckCircle}
              href="/editler"
              color="success"
            />
          </div>
        </section>

        {/* Finans Section - SYNCHRONIZED WITH GELİRLER PAGE ACTIVE PERIOD */}
        <section>
          <div className="flex items-center justify-between mb-3 mt-8">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
              <span>Finans Özeti</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-extrabold text-[10px] lowercase tracking-normal">
                {activeMonthName} {activeYear} (Aktif Dönem)
              </span>
            </h2>
            <Link href="/gelirler" className="text-xs text-primary font-bold hover:underline">
              Gelirler Tablosunu Aç →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Aktif Ay Anlaşma"
              value={formatCurrency(totalExpectedIncome)}
              icon={TrendingUp}
              href="/gelirler"
              color="info"
            />
            <StatCard
              title="Tahsil Edilen (Tam+Kısmi)"
              value={formatCurrency(totalCollectedSoFar)}
              icon={Wallet}
              href="/gelirler"
              color="success"
            />
            <StatCard
              title="Kısmi Alınan Tutar"
              value={formatCurrency(totalPartialPaid)}
              icon={PieChart}
              href="/gelirler"
              color="warning"
            />
            <StatCard
              title="Geciken Ödemeler (7+ Gün)"
              value={formatCurrency(totalOverdueIncome)}
              icon={AlertCircle}
              href="/gelirler"
              color="danger"
            />
            <StatCard
              title="Toplam Gider"
              value={formatCurrency(totalExpenses)}
              icon={TrendingDown}
              href="/giderler"
              color="warning"
            />
          </div>
        </section>

        {/* Bottom Grids: Haftalık Notlar, Çekimler & Ekip Yükü */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-1">
            <HaftalikNotlar />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <WeekShoots />
            <EditorWorkload />
          </div>
        </div>
      </div>
    </div>
  );
}
