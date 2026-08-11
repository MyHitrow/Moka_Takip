'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingDown, Calendar, CreditCard, Trash2, Plus } from 'lucide-react';
import { EXPENSE_CATEGORY_LABELS } from '@/lib/constants';
import { useData } from '@/context/data-context';
import { ExpenseChartWidget } from '@/components/giderler/expense-chart-widget';
import { ConfirmDeleteModal } from '@/components/shared/confirm-delete-modal';

export default function GiderlerPage() {
  return <GiderlerPageContent />;
}

function GiderlerPageContent() {
  const { giderler, addGider, deleteGider, formatDateTr } = useData();
  const [open, setOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('office');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [paidBy, setPaidBy] = useState('Şirket Hesabı');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    addGider({
      title,
      category,
      amount: parseFloat(amount) || 0,
      date: date || todayStr,
      paidBy: paidBy || 'Şirket Hesabı',
    });
    setTitle('');
    setCategory('office');
    setAmount('');
    setDate(todayStr);
    setPaidBy('Şirket Hesabı');
    setOpen(false);
  };

  const totalExpenses = giderler.reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <Header title="Giderler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Giderler & Harcama Analizi"
          subtitle="Gider ve harcama kalemi takibi, kategori analizi ve net ofis/personel harcama dağılımı"
          icon={TrendingDown}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90 font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Yeni Gider Kaydı
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Gider Kaydı Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Gider Başlığı</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Ofis Kirası veya Kadir Avans"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori</Label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
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
                      <Label htmlFor="amount">Tutar (TL)</Label>
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
                      <Label htmlFor="date">Tarih</Label>
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
                    <Label htmlFor="paidBy">Ödeyen Kişi / Hesap</Label>
                    <Input
                      id="paidBy"
                      value={paidBy}
                      onChange={(e) => setPaidBy(e.target.value)}
                      placeholder="Örn: Şirket Hesabı veya Kadir"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold">
                    Kaydet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        <div className="mt-6 space-y-6">
          {/* Visual Category Breakdown & Interactive Chart */}
          <ExpenseChartWidget />

          {/* Table Header & Search/Filter */}
          <div className="flex items-center justify-between pt-2">
            <h3 className="text-base font-bold text-foreground">Harcama Geçmişi & Kayıtlar</h3>
            <span className="text-xs text-muted-foreground font-mono">
              Toplam {giderler.length} kayıt ({formatCurrency(totalExpenses)})
            </span>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Gider Başlığı / Kategori</th>
                  <th className="px-6 py-3">Tutar</th>
                  <th className="px-6 py-3">Tarih</th>
                  <th className="px-6 py-3">Ödeyen</th>
                  <th className="px-6 py-3 rounded-tr-lg text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {giderler.map((expense) => (
                  <tr key={expense.id} className="border-b border-border bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="font-bold text-sm">{expense.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {EXPENSE_CATEGORY_LABELS[expense.category as keyof typeof EXPENSE_CATEGORY_LABELS] || expense.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-400">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center font-mono text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> {formatDateTr(expense.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-xs font-semibold">
                        <CreditCard className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> {expense.paidBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setDeleteConfirmId(expense.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
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

          {/* Mobile Card List View for Phones */}
          <div className="md:hidden space-y-3">
            {giderler.map((expense) => (
              <Card key={expense.id} className="p-4 bg-card border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-base text-foreground">{expense.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {EXPENSE_CATEGORY_LABELS[expense.category as keyof typeof EXPENSE_CATEGORY_LABELS] || expense.category}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirmId(expense.id)}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="my-2 pt-2 border-t border-border/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Tutar</span>
                    <span className="text-lg font-extrabold text-amber-400">{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Tarih</span>
                    <span className="text-xs font-mono">{formatDateTr(expense.date)}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center mt-2">
                  <CreditCard className="w-3.5 h-3.5 mr-1 text-primary" /> Ödeyen: <span className="font-semibold text-foreground ml-1">{expense.paidBy}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!deleteConfirmId}
        onOpenChange={(op) => { if (!op) setDeleteConfirmId(null); }}
        title="Gider Kaydını Sil"
        description="Bu gider/harcama kaydını silmek istediğinize emin misiniz? Bu işlem veritabanından geri alınamaz."
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteGider(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
      />
    </div>
  );
}
