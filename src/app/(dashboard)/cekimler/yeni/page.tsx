'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function YeniCekimPage() {
  const router = useRouter();
  const { isletmeler, addCekim } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  const [client, setClient] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('Stüdyo / Müşteri Adresi');
  const [status, setStatus] = useState('planned');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalClient = client === '__other__' ? customClient.trim() : client.trim();
    if (!finalClient || !title.trim()) return;

    addCekim({
      client: finalClient,
      title: title.trim(),
      date: date || todayStr,
      time: time || '10:00',
      location: location || 'Stüdyo',
      status,
    });

    router.push('/cekimler');
  };

  return (
    <div>
      <Header title="Yeni Çekim Ekle" />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/cekimler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Çekimlere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Yeni Çekim Planla"
          subtitle="Müşteri işletme için yeni video/fotoğraf çekimi planlayın."
          icon={Camera}
        />

        <div className="mt-6 max-w-xl">
          <Card className="p-6 bg-card border-border shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="font-bold text-sm">Müşteri İşletme *</Label>
                <select
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                  required
                >
                  <option value="">İşletme Seçiniz...</option>
                  {isletmeler.map((biz) => (
                    <option key={biz.id} value={biz.name}>
                      {biz.name}
                    </option>
                  ))}
                  <option value="__other__">➕ Manuel İşletme Yaz...</option>
                </select>
              </div>

              {client === '__other__' && (
                <div className="space-y-2">
                  <Label htmlFor="customClient" className="font-semibold text-xs">İşletme Adı Girin *</Label>
                  <Input
                    id="customClient"
                    value={customClient}
                    onChange={(e) => setCustomClient(e.target.value)}
                    placeholder="Örn: Yeni Müşteri Ltd."
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-sm">Çekim Başlığı / Konusu *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 2 Adet Tanıtım Reels & Sinematik Çekim"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="font-semibold text-xs">Çekim Tarihi *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="font-semibold text-xs">Başlangıç Saati</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-semibold text-xs">Çekim Konumu</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Örn: Müşteri Adresi / Adana Stüdyo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="font-semibold text-xs">Çekim Durumu</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                >
                  <option value="planned">📅 Planlandı</option>
                  <option value="ready">🎬 Çekime Hazır</option>
                  <option value="shot">📸 Çekildi</option>
                  <option value="files_transferred">📁 Dosyalar Aktarıldı</option>
                  <option value="completed">✅ Tamamlandı</option>
                  <option value="cancelled">❌ İptal Edildi</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href="/cekimler">
                  <Button variant="outline" type="button">Vazgeç</Button>
                </Link>
                <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold px-6">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Çekimi Kaydet
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
