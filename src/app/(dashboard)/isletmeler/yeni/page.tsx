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
import { Building2, ArrowLeft, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function YeniIsletmePage() {
  const router = useRouter();
  const { addIsletme } = useData();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [fee, setFee] = useState('');
  const [maxDaysBetweenPosts, setMaxDaysBetweenPosts] = useState<number>(3);
  const [monthlyReelsTarget, setMonthlyReelsTarget] = useState<number>(10);
  const [monthlyShootTarget, setMonthlyShootTarget] = useState<number>(2);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addIsletme({
      name: name.trim(),
      contact: contact || '-',
      phone: phone || '-',
      instagram: instagram.startsWith('@') ? instagram : `@${instagram}`,
      fee: fee ? `${fee} ₺` : '0 ₺',
      active: true,
      maxDaysBetweenPosts: Number(maxDaysBetweenPosts) || 3,
      monthlyReelsTarget: Number(monthlyReelsTarget) || 10,
      monthlyShootTarget: Number(monthlyShootTarget) || 2,
      notes,
    });

    router.push('/isletmeler');
  };

  return (
    <div>
      <Header title="Yeni İşletme Ekle" />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/isletmeler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> İşletmelere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Yeni İşletme Ekle & AI Eğit"
          subtitle="Müşteri işletmeyi kaydet, paket kotalarını belirle ve Yapay Zeka Bekçi hafızasına ekle."
          icon={Building2}
        />

        <div className="mt-6 max-w-2xl">
          <Card className="p-6 bg-card border-border shadow-md">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-sm">İşletme Adı *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Atoma Güzellik"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact" className="font-semibold text-xs">Yetkili Kişi</Label>
                  <Input
                    id="contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold text-xs">Telefon</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="font-semibold text-xs">Instagram Kullanıcı Adı</Label>
                  <Input
                    id="instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@kullaniciadi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee" className="font-semibold text-xs">Aylık Paket Ücreti (TL)</Label>
                  <Input
                    id="fee"
                    type="number"
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="15000"
                  />
                </div>
              </div>

              {/* 🤖 AI BEKÇİ EĞİTİM KUTUSU */}
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary animate-pulse" />
                  <span className="font-extrabold text-sm text-primary">🤖 AI Bekçi & Paket Eğitimi Ayarları</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Kaç günde 1 paylaşım?</Label>
                    <Input
                      type="number"
                      value={maxDaysBetweenPosts}
                      onChange={(e) => setMaxDaysBetweenPosts(Number(e.target.value))}
                      className="mt-1"
                      min={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Aylık Reels Hedefi</Label>
                    <Input
                      type="number"
                      value={monthlyReelsTarget}
                      onChange={(e) => setMonthlyReelsTarget(Number(e.target.value))}
                      className="mt-1"
                      min={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Aylık Çekim Hedefi</Label>
                    <Input
                      type="number"
                      value={monthlyShootTarget}
                      onChange={(e) => setMonthlyShootTarget(Number(e.target.value))}
                      className="mt-1"
                      min={1}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label htmlFor="notesInput" className="text-xs font-bold text-foreground">🧠 AI Hafıza & Özel Müşteri Notları</Label>
                  <textarea
                    id="notesInput"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Örn: Taviz vermeyen müşteri, Çekim günlerimiz Salı/Cuma, zor Reels videoları, Ads reklamı gerekli..."
                    className="w-full h-24 rounded-lg border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href="/isletmeler">
                  <Button variant="outline" type="button">Vazgeç</Button>
                </Link>
                <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold px-6">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> İşletmeyi Kaydet & AI Eğit
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
