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
import { TrendingUp, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function YeniGelirPage() {
  const router = useRouter();
  const { isletmeler, addGelir } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  const [client, setClient] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [status, setStatus] = useState('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalClient = client === '__other__' ? customClient.trim() : client.trim();
    if (!finalClient || !amount) return;

    addGelir({
      client: finalClient,
      description: description || `${finalClient} - Tahsilat Kaydı`,
      amount: parseFloat(amount) || 0,
      date: date || todayStr,
      status,
    });

    router.push('/gelirler');
  };

  return (
    <div>
      <Header title="Yeni Gelir Ekle" />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/gelirler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Gelirlere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Yeni Gelir / Tahsilat Fişi Ekle"
          subtitle="Müşteri ödeme ve paket tahsilat kaydı oluşturun."
          icon={TrendingUp}
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
                    placeholder="Örn: Özel Müşteri"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-xs">Açıklama</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Ağustos Ayı Paket Ücreti"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="font-bold text-sm">Tutar (TL) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="15000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="font-semibold text-xs">Vade / Son Ödeme Tarihi *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="font-semibold text-xs">Tahsilat Durumu</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                >
                  <option value="pending">⏳ Bekliyor</option>
                  <option value="paid">✅ Tahsil Edildi (Ödendi)</option>
                  <option value="partial">🟧 Kısmi Ödeme Yapıldı</option>
                  <option value="overdue">🚨 Gecikti!</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href="/gelirler">
                  <Button variant="outline" type="button">Vazgeç</Button>
                </Link>
                <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold px-6">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Geliri Kaydet
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
