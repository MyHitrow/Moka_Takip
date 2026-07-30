'use client';

import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeekShoots } from '@/components/dashboard/week-shoots';
import { EditorWorkload } from '@/components/dashboard/editor-workload';
import { useData } from '@/context/data-context';

import {
  Camera,
  Video,
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  CalendarClock
} from 'lucide-react';

export default function DashboardPage() {
  const { cekimler, editler, gelirler, giderler } = useData();

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
  const readyEdits = editler.filter((e) => e.status === 'ready').length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Dashboard"
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
              title="Yayına Hazır"
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

        {/* Bottom Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <WeekShoots />
          <EditorWorkload />
        </div>
      </div>
    </div>
  );
}
