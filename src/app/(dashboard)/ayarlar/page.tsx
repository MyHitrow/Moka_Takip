'use client';

import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Settings, ShieldCheck, Database, Cloud } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function AyarlarPage() {
  const { isCloudConnected } = useData();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-0 md:pt-5 bg-[#0D0E10] min-h-screen">
      <Header title="Ayarlar" subtitle="Sistem ve veritabanı durumu" />

      <PageHeader
        title="Sistem & Bulut Ayarları"
        subtitle="Sistem durumu, bulut veritabanı senkronizasyonu ve genel konfigürasyon."
        icon={Settings}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulut Bağlantısı Kartı */}
        <Card className="p-6 bg-[#111214] border-[#2B2D32]">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Bulut Bağlantı Durumu</h2>
              <p className="text-xs text-muted-foreground">Supabase Veritabanı Senkronizasyonu</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <span className="text-xs font-semibold text-muted-foreground">Bağlantı</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCloudConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'}`}>
              {isCloudConnected ? '● Aktif ve Senkronize' : '○ Bağlantı Kuruluyor...'}
            </span>
          </div>
        </Card>

        {/* Veritabanı & Güvenlik Kartı */}
        <Card className="p-6 bg-[#111214] border-[#2B2D32]">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-3 rounded-xl text-primary">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Veri Güvenliği</h2>
              <p className="text-xs text-muted-foreground">Otomatik Yedekleme ve Gerçek Zamanlı Sync</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <span className="text-xs font-semibold text-muted-foreground">Realtime Sync</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Etkin (PostgreSQL Broadcast)
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
