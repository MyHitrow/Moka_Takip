'use client';

import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/dashboard/stat-card';
import { WeekShoots } from '@/components/dashboard/week-shoots';
import { EditorWorkload } from '@/components/dashboard/editor-workload';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { FinanceChartWidget } from '@/components/dashboard/finance-chart-widget';
import { useData } from '@/context/data-context';
import {
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, cekimler, editler, gelirler, giderler } = useData();

  const totalGelir = gelirler.reduce((acc, curr) => acc + curr.amount, 0) || 1250000;
  const totalGider = giderler.reduce((acc, curr) => acc + curr.amount, 0) || 620000;

  const formatCurrency = (val: number) =>
    `₺${val.toLocaleString('tr-TR')}`;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-0 md:pt-5 bg-[#0D0E10] min-h-screen">
      <Header title="Genel Bakış" subtitle="Ajansındaki tüm işleri buradan yönetebilirsin." />

      {/* Welcome Title & Date Picker Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 pb-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F7F7F8] tracking-tight">
            Hoş geldin, {currentUser.name.split(' ')[0]}.
          </h1>
          <p className="text-xs text-[#73767E] mt-0.5 font-medium">
            Ajansındaki tüm işleri buradan yönetebilirsin.
          </p>
        </div>

        {/* Date Selector Dropdown */}
        <div className="flex items-center gap-2 bg-[#17181B] border border-[#2B2D32] rounded-lg px-3 py-1.5 text-xs text-[#F7F7F8] font-semibold shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-[#73767E]" />
          <span>24 Mayıs 2024, Cuma</span>
          <span className="text-[10px] text-[#73767E] ml-1">▼</span>
        </div>
      </div>

      {/* Top 6 Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Toplam Proje"
          value="24"
          icon={FolderKanban}
          href="/isletmeler"
          trend={{ value: 12, label: 'bu ay' }}
        />
        <StatCard
          title="Devam Eden İş"
          value="13"
          icon={Clock}
          href="/editler"
          trend={{ value: 8, label: 'bu ay' }}
        />
        <StatCard
          title="Tamamlanan İş"
          value="48"
          icon={CheckCircle2}
          href="/editler"
          trend={{ value: 24, label: 'bu ay' }}
        />
        <StatCard
          title="Bekleyen Onay"
          value="7"
          icon={AlertCircle}
          href="/editler"
          trend={{ value: 5, label: 'bu ay' }}
        />
        <StatCard
          title="Toplam Gelir"
          value="₺1.250.000"
          icon={TrendingUp}
          href="/gelirler"
          trend={{ value: 18, label: 'bu ay' }}
        />
        <StatCard
          title="Toplam Gider"
          value="₺620.000"
          icon={TrendingDown}
          href="/giderler"
          trend={{ value: 11, label: 'bu ay' }}
        />
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column (2/3 width): Yaklaşan İşler + Son Aktiviteler */}
        <div className="lg:col-span-2 space-y-6">
          <WeekShoots />
          <RecentActivities />
        </div>

        {/* Right Column (1/3 width): İş Yükü Dağılımı + Gelir / Gider Özeti */}
        <div className="lg:col-span-1 space-y-6">
          <EditorWorkload />
          <FinanceChartWidget />
        </div>
      </div>
    </div>
  );
}
