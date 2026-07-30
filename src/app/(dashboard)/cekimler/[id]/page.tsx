'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Calendar, Clock, MapPin, ArrowLeft, Film, Users } from 'lucide-react';
import { useData } from '@/context/data-context';
import { SHOOT_STATUS_LABELS, SHOOT_STATUS_COLORS } from '@/lib/constants';

export default function CekimDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { cekimler, editler, ekip, formatDateTr } = useData();

  const shoot = cekimler.find((c) => c.id === id) || cekimler[0];

  if (!shoot) {
    return (
      <div>
        <Header title="Çekim Bulunamadı" />
        <div className="p-8">
          <p>Aradığınız çekim kaydı bulunamadı.</p>
          <Link href="/cekimler">
            <Button className="mt-4">Çekimlere Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedEdits = editler.filter((e) => e.client.toLowerCase() === shoot.client.toLowerCase());

  return (
    <div>
      <Header title={`${shoot.client} — Çekim Detayı`} />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/cekimler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Çekimlere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title={shoot.title}
          subtitle={`Müşteri: ${shoot.client}`}
          icon={Camera}
          action={
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 ${
                SHOOT_STATUS_COLORS?.[shoot.status as keyof typeof SHOOT_STATUS_COLORS] || ''
              }`}
            >
              {SHOOT_STATUS_LABELS?.[shoot.status as keyof typeof SHOOT_STATUS_LABELS] || shoot.status}
            </Badge>
          }
        />

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Çekim Tarihi & Saati</span>
              <div className="mt-2 space-y-1">
                <p className="text-base font-bold text-foreground flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" /> {formatDateTr(shoot.date)}
                </p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" /> Saat: {shoot.time}
                </p>
              </div>
            </Card>

            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Çekim Konumu</span>
              <p className="text-base font-bold text-foreground mt-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" /> {shoot.location}
              </p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Ekip & Görevliler</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ekip.slice(0, 3).map((m) => (
                  <Badge key={m.id} variant="secondary" className="text-xs">
                    {m.name} ({m.role})
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Related Edits */}
          <Card className="p-6 bg-card border border-border">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Film className="w-5 h-5 text-primary" /> Bu Çekimle İlgili Edit Kurguları ({relatedEdits.length})
            </h3>

            <div className="space-y-3">
              {relatedEdits.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">Bu çekim için henüz bağlı bir edit görevi açılmamış.</p>
              ) : (
                relatedEdits.map((edit) => (
                  <div key={edit.id} className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{edit.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Editör: {edit.editor} | Teslim: {formatDateTr(edit.deadline)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {edit.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
