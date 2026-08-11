'use client';

import { use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Film, Calendar, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function EditDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { editler, updateEditStatus, formatDateTr } = useData();

  const edit = editler.find((e) => e.id === id);

  if (!edit) {
    return (
      <div>
        <Header title="Edit Bulunamadı" />
        <div className="p-8">
          <p>Aradığınız edit kaydı bulunamadı.</p>
          <Link href="/editler">
            <Button className="mt-4">Editlere Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={`${edit.title} — Edit Detayı`} />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/editler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Editlere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title={edit.title}
          subtitle={`Müşteri: ${edit.client} | Tipi: ${edit.type}`}
          icon={Film}
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Durumu Değiştir:</span>
              <select
                value={edit.status}
                onChange={(e) => updateEditStatus(edit.id, e.target.value)}
                className="text-xs bg-card border border-border rounded-lg px-3 py-1.5 font-semibold text-foreground outline-none cursor-pointer"
              >
                <option value="waiting">Kurgu Bekliyor</option>
                <option value="editing">Kurguda</option>
                <option value="client_review">Müşteri Onayında</option>
                <option value="ready">Yayına Hazır</option>
              </select>
            </div>
          }
        />

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Sorumlu Editör</span>
              <p className="text-base font-bold text-foreground mt-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-primary" /> {edit.editor}
              </p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">Son Teslim Tarihi</span>
              <p className="text-base font-bold text-foreground mt-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" /> {formatDateTr(edit.deadline)}
              </p>
            </Card>

            <Card className="p-5 bg-card border-border">
              <span className="text-xs text-muted-foreground font-semibold uppercase">İçerik Türü</span>
              <div className="mt-2">
                <Badge variant="outline" className="text-sm px-3 py-1">{edit.type}</Badge>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-card border border-border">
            <h3 className="font-bold text-lg mb-3">Kurgu Süreci & Notlar</h3>
            <p className="text-sm text-muted-foreground">
              İçerik kurgu aşamasındadır. Revize talepleri ve onay süreçleri editör tarafından bu sayfadan takip edilmektedir.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
