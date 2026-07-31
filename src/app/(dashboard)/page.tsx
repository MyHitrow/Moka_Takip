'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeekShoots } from '@/components/dashboard/week-shoots';
import { EditorWorkload } from '@/components/dashboard/editor-workload';
import { HaftalikNotlar } from '@/components/dashboard/haftalik-notlar';
import { useData } from '@/context/data-context';
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
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  const { cekimler, editler, gelirler, giderler, currentUser, formatDateTr } = useData();

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  const totalExpectedIncome = gelirler.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaidIncome = gelirler.filter((g) => g.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdueIncome = gelirler.filter((g) => g.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = giderler.reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalPaidIncome - totalExpenses;

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
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
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

        {/* Finans Section */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold mt-8">Finans Özeti</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Beklenen Gelir"
              value={formatCurrency(totalExpectedIncome)}
              icon={TrendingUp}
              href="/gelirler"
              color="info"
            />
            <StatCard
              title="Tahsil Edilen"
              value={formatCurrency(totalPaidIncome)}
              icon={Wallet}
              href="/gelirler"
              color="success"
            />
            <StatCard
              title="Geciken Ödemeler"
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
            <StatCard
              title="Net Durum"
              value={formatCurrency(netBalance)}
              icon={Wallet}
              href="/gelirler"
              color={netBalance >= 0 ? "success" : "danger"}
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
