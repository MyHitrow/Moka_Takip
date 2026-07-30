'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Phone, AtSign, CheckCircle2, ArrowLeft, Camera, Film, TrendingUp, Wallet } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function IsletmeDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isletmeler, cekimler, editler, gelirler, formatDateTr } = useData();

  const business = isletmeler.find((b) => b.id === id) || isletmeler[0];

  if (!business) {
    return (
      <div>
        <Header title="İşletme Bulunamadı" />
        <div className="p-8">
          <p>Aradığınız işletme bulunamadı.</p>
          <Link href="/isletmeler">
            <Button className="mt-4">İşletmelere Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const clientShoots = cekimler.filter((c) => c.client.toLowerCase().includes(business.name.toLowerCase()));
  const clientEdits = editler.filter((e) => e.client.toLowerCase().includes(business.name.toLowerCase()));
  const clientGelirler = gelirler.filter((g) => g.client.toLowerCase().includes(business.name.toLowerCase()));

  const totalPaid = clientGelirler.filter((g) => g.status === 'paid').reduce((a, b) => a + b.amount, 0);
  const totalPending = clientGelirler.filter((g) => g.status !== 'paid').reduce((a, b) => a + b.amount, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <Header title={`${business.name} — Detay`} />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/isletmeler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> İşletmelere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title={business.name}
          subtitle={`Müşteri Detay Kartı & Geçmiş Hareketler`}
          icon={Building2}
          action={
            business.active ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm px-3 py-1">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Aktif Sözleşmeli Müşteri
              </Badge>
            ) : (
              <Badge variant="secondary">Pasif Müşteri</Badge>
            )
          }
        />

        <div className="mt-6 space-y-6">
          {/* Info Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Yetkili Kişi</span>
              <h3 className="text-lg font-bold text-foreground mt-1">{business.contact}</h3>
            </Card>
            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">İletişim & Sosyal Medya</span>
              <div className="mt-1 space-y-1 text-sm text-foreground">
                <div className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-primary" /> {business.phone}</div>
                <div className="flex items-center"><AtSign className="w-3.5 h-3.5 mr-2 text-primary" /> {business.instagram}</div>
              </div>
            </Card>
            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Aylık Paket Ücreti</span>
              <h3 className="text-xl font-extrabold text-emerald-400 mt-1">{business.fee}</h3>
            </Card>
            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Toplam Ödenen / Tahsilat</span>
              <h3 className="text-xl font-extrabold text-blue-400 mt-1">{formatCurrency(totalPaid)}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">Bekleyen: {formatCurrency(totalPending)}</p>
            </Card>
          </div>

          {/* Activity Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shoots */}
            <Card className="p-5 bg-card border border-border">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" /> Müşterinin Çekimleri ({clientShoots.length})
              </h3>
              <div className="space-y-3">
                {clientShoots.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4">Kayıtlı çekim bulunmuyor.</p>
                ) : (
                  clientShoots.map((shoot) => (
                    <div key={shoot.id} className="p-3 bg-muted/30 rounded-xl border border-border">
                      <div className="flex justify-between items-start font-medium text-sm">
                        <span>{shoot.title}</span>
                        <Badge variant="outline" className="text-[10px]">{shoot.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTr(shoot.date)} - {shoot.time} ({shoot.location})</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Edits */}
            <Card className="p-5 bg-card border border-border">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <Film className="w-4 h-4 text-primary" /> Müşterinin Editleri ({clientEdits.length})
              </h3>
              <div className="space-y-3">
                {clientEdits.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4">Kayıtlı edit bulunmuyor.</p>
                ) : (
                  clientEdits.map((edit) => (
                    <div key={edit.id} className="p-3 bg-muted/30 rounded-xl border border-border">
                      <div className="flex justify-between items-start font-medium text-sm">
                        <span>{edit.title}</span>
                        <Badge variant="outline" className="text-[10px]">{edit.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Editör: {edit.editor} | Teslim: {formatDateTr(edit.deadline)}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Income History */}
            <Card className="p-5 bg-card border border-border">
              <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Tahsilat Geçmişi ({clientGelirler.length})
              </h3>
              <div className="space-y-3">
                {clientGelirler.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4">Kayıtlı tahsilat bulunmuyor.</p>
                ) : (
                  clientGelirler.map((g) => (
                    <div key={g.id} className="p-3 bg-muted/30 rounded-xl border border-border flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{g.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTr(g.date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm block">{formatCurrency(g.amount)}</span>
                        <Badge variant="outline" className={g.status === 'paid' ? 'text-emerald-400 text-[10px]' : 'text-amber-400 text-[10px]'}>
                          {g.status === 'paid' ? 'Ödendi' : 'Bekliyor'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
