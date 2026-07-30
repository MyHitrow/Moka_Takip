'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp, Wallet, ArrowUpRight, AlertCircle, Trash2, Plus, CheckCircle2, RefreshCw } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function GelirlerPage() {
  const { gelirler, isletmeler, addGelir, deleteGelir, updateGelirStatus, generateMonthlyIncomes, formatDateTr } = useData();
  const [open, setOpen] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState('');

  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pending');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !amount) return;
    addGelir({
      client,
      description: description || 'Hizmet / Anlaşma Bedeli',
      amount: parseFloat(amount) || 0,
      date: date || todayStr,
      status,
    });
    setClient('');
    setDescription('');
    setAmount('');
    setDate('');
    setStatus('pending');
    setOpen(false);
  };

  const handleGenerateMonthly = () => {
    const count = generateMonthlyIncomes();
    if (count > 0) {
      setGeneratedMsg(`${count} adet aktif işletmenin bu ayki tahsilat fişi başarıyla eklendi!`);
    } else {
      setGeneratedMsg('Tüm aktif işletmelerin bu ayki tahsilat fişleri zaten mevcut.');
    }
    setTimeout(() => setGeneratedMsg(''), 4000);
  };

  const getItemStatus = (income: { status: string; date: string }) => {
    if (income.status === 'paid') return 'paid';
    if (income.status === 'overdue' || (income.status === 'pending' && income.date < todayStr)) {
      return 'overdue';
    }
    return 'pending';
  };

  const totalExpected = gelirler.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = gelirler.filter((g) => g.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = gelirler
    .filter((g) => getItemStatus(g) === 'overdue' || getItemStatus(g) === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <Header title="Gelirler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Gelirler & Tahsilat"
          subtitle="Gelir ve tahsilat takibi (Ayın İlk Haftası Ödemeleri)"
          icon={TrendingUp}
          action={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleGenerateMonthly}
                className="bg-card border-border hover:bg-muted text-xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Fişleri Bastır
              </Button>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button className="bg-primary hover:bg-primary/90 shrink-0">
                      <Plus className="w-4 h-4 mr-2" /> Yeni Gelir Kaydı
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Yeni Gelir Kaydı Ekle</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="client">Müşteri / İşletme</Label>
                      <select
                        id="clientSelect"
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">İşletme Seçin</option>
                        {isletmeler.map((isletme) => (
                          <option key={isletme.id} value={isletme.name}>
                            {isletme.name} ({isletme.fee})
                          </option>
                        ))}
                        <option value="Diğer Müşteri">Diğer Müşteri</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Açıklama</Label>
                      <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Örn: Ağustos Ayı Anlaşma Ücreti"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Tutar (TL)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="5000"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">Vade Tarihi</Label>
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
                      <Label htmlFor="status">Tahsilat Durumu</Label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="pending">Bekliyor (Ayın İlk Haftası Vadesi)</option>
                        <option value="paid">Ödendi (Tamamlandı)</option>
                        <option value="overdue">Gecikti!</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full mt-4">
                      Kaydet
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        {generatedMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl animate-fade-in">
            {generatedMsg}
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 sm:p-5 bg-card border-border flex items-center">
              <div className="bg-blue-500/10 p-3 rounded-full mr-3 shrink-0">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Toplam Beklenen</p>
                <h3 className="text-xl sm:text-2xl font-bold">{formatCurrency(totalExpected)}</h3>
              </div>
            </Card>
            <Card className="p-4 sm:p-5 bg-card border-border flex items-center">
              <div className="bg-emerald-500/10 p-3 rounded-full mr-3 shrink-0">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Tahsil Edilen (Ödendi)</p>
                <h3 className="text-xl sm:text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</h3>
              </div>
            </Card>
            <Card className="p-4 sm:p-5 bg-card border-border flex items-center">
              <div className="bg-red-500/10 p-3 rounded-full mr-3 shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Bekleyen / Geciken</p>
                <h3 className="text-xl sm:text-2xl font-bold text-amber-400">{formatCurrency(totalOverdue)}</h3>
              </div>
            </Card>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Müşteri / Açıklama</th>
                  <th className="px-6 py-3">Tutar</th>
                  <th className="px-6 py-3">Vade Tarihi</th>
                  <th className="px-6 py-3">Tahsilat Durumu</th>
                  <th className="px-6 py-3 rounded-tr-lg text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {gelirler.map((income) => {
                  const calculatedStatus = getItemStatus(income);
                  const isOverdue = calculatedStatus === 'overdue';

                  return (
                    <tr
                      key={income.id}
                      className={`border-b border-border transition-colors ${
                        isOverdue
                          ? 'bg-red-500/10 hover:bg-red-500/15'
                          : 'bg-card hover:bg-muted/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className={`font-medium ${isOverdue ? 'text-red-300 font-bold' : 'text-foreground'}`}>
                          {income.client}
                        </div>
                        <div className="text-xs text-muted-foreground">{income.description}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {formatCurrency(income.amount)}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {formatDateTr(income.date)}
                        {isOverdue && (
                          <span className="block text-[10px] text-red-400 font-bold mt-0.5">
                            Gecikti! (Vadesi Geçti)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={calculatedStatus}
                            onChange={(e) => updateGelirStatus(income.id, e.target.value)}
                            className={`text-xs font-semibold rounded-lg px-2.5 py-1 border cursor-pointer outline-none transition-colors ${
                              calculatedStatus === 'paid'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : isOverdue
                                ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold'
                                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            <option value="pending" className="bg-card text-foreground">Bekliyor (Ayın İlk Haftası)</option>
                            <option value="paid" className="bg-card text-foreground">Ödendi (Tamamlandı)</option>
                            <option value="overdue" className="bg-card text-foreground">Gecikti!</option>
                          </select>

                          {calculatedStatus !== 'paid' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateGelirStatus(income.id, 'paid')}
                              className="h-7 text-[11px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ödendi Yap
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteGelir(income.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View for Phones */}
          <div className="md:hidden space-y-3">
            {gelirler.map((income) => {
              const calculatedStatus = getItemStatus(income);
              const isOverdue = calculatedStatus === 'overdue';

              return (
                <Card
                  key={income.id}
                  className={`p-4 border ${
                    isOverdue ? 'bg-red-500/10 border-red-500/30' : 'bg-card border-border'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold text-base ${isOverdue ? 'text-red-300' : 'text-foreground'}`}>
                        {income.client}
                      </h4>
                      <p className="text-xs text-muted-foreground">{income.description}</p>
                    </div>
                    <button
                      onClick={() => deleteGelir(income.id)}
                      className="text-muted-foreground hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="my-3 pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Tutar</span>
                      <span className="text-lg font-extrabold text-foreground">{formatCurrency(income.amount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Vade Tarihi</span>
                      <span className="text-xs font-mono font-medium">{formatDateTr(income.date)}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Durumu:</span>
                      <select
                        value={calculatedStatus}
                        onChange={(e) => updateGelirStatus(income.id, e.target.value)}
                        className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-medium outline-none"
                      >
                        <option value="pending">Bekliyor (Ayın İlk Haftası)</option>
                        <option value="paid">Ödendi (Tamamlandı)</option>
                        <option value="overdue">Gecikti!</option>
                      </select>
                    </div>

                    {calculatedStatus !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => updateGelirStatus(income.id, 'paid')}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ödendi Olarak İşaretle
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
