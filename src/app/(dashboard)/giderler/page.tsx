'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingDown, Trash2, Plus, Wallet } from 'lucide-react';
import { EXPENSE_CATEGORY_LABELS } from '@/lib/constants';
import { useData } from '@/context/data-context';

export default function GiderlerPage() {
  const { giderler, addGider, deleteGider } = useData();
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('office');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [paidBy, setPaidBy] = useState('Şirket Hesabı');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    addGider({
      title,
      category,
      amount: parseFloat(amount) || 0,
      date: date || new Date().toISOString().split('T')[0],
      paidBy: paidBy || 'Kredi Kartı',
    });
    setTitle('');
    setCategory('office');
    setAmount('');
    setDate('');
    setPaidBy('Şirket Hesabı');
    setOpen(false);
  };

  const totalExpense = giderler.reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <Header title="Giderler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Giderler"
          subtitle="Gider takibi ve yönetimi"
          icon={TrendingDown}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Yeni Gider
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Gider Kaydı Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Gider Başlığı / Açıklama</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Adobe Creative Cloud Lisansı"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="office">Ofis</option>
                        <option value="equipment">Ekipman</option>
                        <option value="software">Yazılım</option>
                        <option value="transportation">Ulaşım</option>
                        <option value="food">Yemek</option>
                        <option value="personnel">Personel</option>
                        <option value="advertising">Reklam</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Tutar (TL)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="1200"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Tarih</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paidBy">Ödeme Şekli / Sahibi</Label>
                      <Input
                        id="paidBy"
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        placeholder="Şirket Kartı"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-4">
                    Kaydet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />
        <div className="mt-6 space-y-6">
          <Card className="p-5 bg-card border-border flex items-center max-w-sm">
            <div className="bg-amber-500/10 p-3 rounded-full mr-4">
              <Wallet className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Toplam Harcama / Gider</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalExpense)}</h3>
            </div>
          </Card>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Kategori / Açıklama</th>
                  <th className="px-6 py-3">Tutar</th>
                  <th className="px-6 py-3">Tarih</th>
                  <th className="px-6 py-3">Ödeme Şekli</th>
                  <th className="px-6 py-3 rounded-tr-lg text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {giderler.map((expense) => (
                  <tr key={expense.id} className="border-b border-border bg-card">
                    <td className="px-6 py-4">
                      <div className="mb-1">
                        <Badge variant="secondary" className="text-[10px]">
                          {EXPENSE_CATEGORY_LABELS?.[expense.category as keyof typeof EXPENSE_CATEGORY_LABELS] || expense.category}
                        </Badge>
                      </div>
                      <div className="font-medium text-foreground">{expense.title}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4">{expense.date}</td>
                    <td className="px-6 py-4">{expense.paidBy}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteGider(expense.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
