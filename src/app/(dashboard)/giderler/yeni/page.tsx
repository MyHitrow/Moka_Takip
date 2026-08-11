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
import { TrendingDown, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { EXPENSE_CATEGORY_LABELS } from '@/lib/constants';
import { useData } from '@/context/data-context';

export default function YeniGiderPage() {
  const router = useRouter();
  const { addGider } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('office');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [paidBy, setPaidBy] = useState('Şirket Hesabı');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    addGider({
      title: title.trim(),
      category,
      amount: parseFloat(amount) || 0,
      date: date || todayStr,
      paidBy: paidBy || 'Şirket Hesabı',
    });

    router.push('/giderler');
  };

  return (
    <div>
      <Header title="Yeni Gider Ekle" />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/giderler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Giderlere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Yeni Gider Kaydı Ekle"
          subtitle="Ofis, personel, araç veya ekipman harcama kaydı ekleyin."
          icon={TrendingDown}
        />

        <div className="mt-6 max-w-xl">
          <Card className="p-6 bg-card border-border shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-sm">Gider / Harcama Başlığı *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Ofis Kirası veya Kadir Avans"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-xs">Gider Kategorisi</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                >
                  {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="font-bold text-sm">Tutar (TL) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="12000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="font-semibold text-xs">Harcama Tarihi *</Label>
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
                <Label htmlFor="paidBy" className="font-semibold text-xs">Ödeyen Kişi / Hesap</Label>
                <Input
                  id="paidBy"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="Örn: Şirket Hesabı veya Kadir"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href="/giderler">
                  <Button variant="outline" type="button">Vazgeç</Button>
                </Link>
                <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold px-6">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Gideri Kaydet
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
