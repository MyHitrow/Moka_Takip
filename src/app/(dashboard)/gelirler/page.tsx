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
import { TrendingUp, Wallet, ArrowUpRight, AlertCircle, Trash2, Plus, CheckCircle2, RefreshCw, Calendar } from 'lucide-react';
import { useData } from '@/context/data-context';

const MONTHS_TR = [
  { key: '01', name: 'Ocak' },
  { key: '02', name: 'Şubat' },
  { key: '03', name: 'Mart' },
  { key: '04', name: 'Nisan' },
  { key: '05', name: 'Mayıs' },
  { key: '06', name: 'Haziran' },
  { key: '07', name: 'Temmuz' },
  { key: '08', name: 'Ağustos' },
  { key: '09', name: 'Eylül' },
  { key: '10', name: 'Ekim' },
  { key: '11', name: 'Kasım' },
  { key: '12', name: 'Aralık' },
];

export default function GelirlerPage() {
  const { gelirler, isletmeler, addGelir, deleteGelir, updateGelirStatus, generateMonthlyIncomes, formatDateTr } = useData();

  const now = new Date();
  const currentMonthStr = String(now.getMonth() + 1).padStart(2, '0');
  const currentYearStr = String(now.getFullYear());

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [open, setOpen] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState('');

  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pending');

  const todayStr = now.toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !amount) return;

    const selectedMonthObj = MONTHS_TR.find((m) => m.key === selectedMonth);
    const monthName = selectedMonthObj ? selectedMonthObj.name : '';

    addGelir({
      client,
      description: description || `${monthName} Ayı Anlaşma Bedeli`,
      amount: parseFloat(amount) || 0,
      date: date || `${currentYearStr}-${selectedMonth}-05`,
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
    const targetMonthStr = `${currentYearStr}-${selectedMonth}`;
    const count = generateMonthlyIncomes(targetMonthStr);
    const selectedMonthName = MONTHS_TR.find((m) => m.key === selectedMonth)?.name;

    if (count > 0) {
      setGeneratedMsg(`${selectedMonthName} ayı için ${count} adet aktif işletmenin tahsilat fişi başarıyla oluşturuldu!`);
    } else {
      setGeneratedMsg(`${selectedMonthName} ayı için aktif işletmelerin tahsilat fişleri zaten mevcut.`);
    }
    setTimeout(() => setGeneratedMsg(''), 4000);
  };

  // CALCULATE COLLECTION STATUS BASED ON USER'S BUSINESS RULES:
  // 1st Week (Days 1 - 7): "Bekliyor (Ayın İlk Haftası Vadesi)"
  // 2nd Week Onwards (Day 8+): Automatically switches to "Gecikti! (2. Haftadan İtibaren Gecikmede)"
  const getItemStatus = (income: { status: string; date: string }) => {
    if (income.status === 'paid') return 'paid';

    const parts = income.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;

      const currentYear = now.getFullYear();
      const currentMonthIndex = now.getMonth();
      const currentDay = now.getDate();

      // Past months -> Always Gecikti!
      if (year < currentYear || (year === currentYear && monthIndex < currentMonthIndex)) {
        return 'overdue';
      }

      // Current month:
      if (year === currentYear && monthIndex === currentMonthIndex) {
        // Day 1 - 7: Bekliyor (Ayın İlk Haftası)
        // Day 8+: Gecikti!
        if (currentDay > 7) {
          return 'overdue';
        }
        return 'pending';
      }

      // Future month:
      return 'pending';
    }

    return income.status;
  };

  // Filter gelirler by selected 12-month tab (or all)
  const filteredGelirler = gelirler.filter((g) => {
    if (selectedMonth === 'all') return true;
    const parts = g.date.split('-');
    return parts.length >= 2 && parts[1] === selectedMonth;
  });

  const totalExpected = filteredGelirler.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = filteredGelirler.filter((g) => g.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOverdue = filteredGelirler
    .filter((g) => getItemStatus(g) === 'overdue' || (g.status !== 'paid' && getItemStatus(g) === 'pending'))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <Header title="Gelirler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Gelirler & 12 Aylık Tahsilat Takvimi"
          subtitle="Ayın ilk haftası tahsilatı (1-7. Günler Bekliyor, 8. Günden itibaren Gecikmede)"
          icon={TrendingUp}
          action={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={handleGenerateMonthly}
                className="bg-card border-border hover:bg-muted text-xs shrink-0 font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Seçili Ay İçin Fişleri Oluştur
              </Button>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button className="bg-primary hover:bg-primary/90 shrink-0 font-bold">
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
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
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
                        placeholder="Örn: Paket Ücreti (Ayın İlk Haftası)"
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
                          placeholder="8000"
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
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
                      >
                        <option value="pending">🟡 Bekliyor (Ayın İlk Haftası)</option>
                        <option value="paid">🟢 Ödendi (Tamamlandı)</option>
                        <option value="overdue">🔴 Gecikti (2. Haftadan İtibaren)</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold">
                      Kaydet
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          }
        />

        {/* 12-MONTH CALENDAR SELECTOR TABS */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" /> 12 Aylık Tahsilat Takvimi ({currentYearStr})
            </h3>
            <button
              onClick={() => setSelectedMonth('all')}
              className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${
                selectedMonth === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              Tüm Yıl
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 bg-card/60 p-2 rounded-2xl border border-border">
            {MONTHS_TR.map((m) => {
              const isSelected = selectedMonth === m.key;
              const isCurrent = currentMonthStr === m.key;

              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMonth(m.key)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-primary text-white shadow-md red-glow'
                      : isCurrent
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span>{m.name}</span>
                  {isCurrent && (
                    <span className="text-[9px] opacity-80 font-mono font-normal">Bu Ay</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {generatedMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm rounded-xl animate-fade-in font-bold">
            {generatedMsg}
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Summary Cards for Selected Month */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 sm:p-5 bg-card border-border flex items-center shadow-xs">
              <div className="bg-blue-500/10 p-3 rounded-full mr-3 shrink-0 border border-blue-500/20">
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">
                  {selectedMonth === 'all' ? 'Tüm Yıl Beklenen' : `${MONTHS_TR.find(m=>m.key===selectedMonth)?.name} Beklenen`}
                </p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground">{formatCurrency(totalExpected)}</h3>
              </div>
            </Card>
            <Card className="p-4 sm:p-5 bg-card border-border flex items-center shadow-xs">
              <div className="bg-emerald-500/10 p-3 rounded-full mr-3 shrink-0 border border-emerald-500/20">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Tahsil Edilen (Ödendi)</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-400">{formatCurrency(totalPaid)}</h3>
              </div>
            </Card>
            <Card className="p-4 sm:p-5 bg-card border-border flex items-center shadow-xs">
              <div className="bg-red-500/10 p-3 rounded-full mr-3 shrink-0 border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Kalan / Geciken Tutarlar</p>
                <h3 className="text-xl sm:text-2xl font-extrabold text-amber-400">{formatCurrency(totalOverdue)}</h3>
              </div>
            </Card>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Müşteri / Açıklama</th>
                  <th className="px-6 py-3">Tutar</th>
                  <th className="px-6 py-3">Vade Tarihi</th>
                  <th className="px-6 py-3">Tahsilat Durumu</th>
                  <th className="px-6 py-3 rounded-tr-lg text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredGelirler.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      Bu ay için herhangi bir tahsilat kaydı bulunmuyor. *"Seçili Ay İçin Fişleri Oluştur"* butonuna basarak otomatik ekleyebilirsiniz.
                    </td>
                  </tr>
                ) : (
                  filteredGelirler.map((income) => {
                    const calculatedStatus = getItemStatus(income);
                    const isOverdue = calculatedStatus === 'overdue';

                    return (
                      <tr
                        key={income.id}
                        className={`border-b border-border transition-colors ${
                          isOverdue
                            ? 'bg-red-500/10 hover:bg-red-500/15'
                            : income.status === 'paid'
                            ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                            : 'bg-card hover:bg-muted/30'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`font-extrabold text-base ${isOverdue ? 'text-red-300' : 'text-foreground'}`}>
                            {income.client}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{income.description}</div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-foreground text-base font-mono">
                          {formatCurrency(income.amount)}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {formatDateTr(income.date)}
                          {isOverdue && (
                            <span className="block text-[10px] text-red-400 font-extrabold mt-0.5">
                              ⚠️ 2. Haftadan İtibaren Gecikmede!
                            </span>
                          )}
                          {!isOverdue && calculatedStatus === 'pending' && (
                            <span className="block text-[10px] text-amber-400 font-semibold mt-0.5">
                              🟡 Ayın 1. Haftası Beklemede
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={calculatedStatus}
                              onChange={(e) => updateGelirStatus(income.id, e.target.value)}
                              className={`text-xs font-extrabold rounded-lg px-2.5 py-1.5 border cursor-pointer outline-none transition-colors ${
                                calculatedStatus === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : isOverdue
                                  ? 'bg-red-500/20 text-red-300 border-red-500/50 font-bold'
                                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              }`}
                            >
                              <option value="pending" className="bg-card text-foreground">🟡 Bekliyor (Ayın İlk Haftası)</option>
                              <option value="paid" className="bg-card text-foreground">🟢 Ödendi (Tamamlandı)</option>
                              <option value="overdue" className="bg-card text-foreground">🔴 Gecikti! (2. Haftadan İtibaren)</option>
                            </select>

                            {calculatedStatus !== 'paid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateGelirStatus(income.id, 'paid')}
                                className="h-8 text-xs bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 font-bold"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ödendi İşaretle
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
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View for Phones */}
          <div className="md:hidden space-y-3">
            {filteredGelirler.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                Bu ay için tahsilat kaydı bulunmuyor.
              </Card>
            ) : (
              filteredGelirler.map((income) => {
                const calculatedStatus = getItemStatus(income);
                const isOverdue = calculatedStatus === 'overdue';

                return (
                  <Card
                    key={income.id}
                    className={`p-4 border ${
                      isOverdue
                        ? 'bg-red-500/10 border-red-500/40'
                        : income.status === 'paid'
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`font-extrabold text-base ${isOverdue ? 'text-red-300' : 'text-foreground'}`}>
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
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Tutar</span>
                        <span className="text-lg font-extrabold text-foreground font-mono">{formatCurrency(income.amount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Vade Tarihi</span>
                        <span className="text-xs font-mono font-semibold">{formatDateTr(income.date)}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-bold">Durum:</span>
                        <select
                          value={calculatedStatus}
                          onChange={(e) => updateGelirStatus(income.id, e.target.value)}
                          className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-bold outline-none"
                        >
                          <option value="pending">🟡 Bekliyor (Ayın İlk Haftası)</option>
                          <option value="paid">🟢 Ödendi (Tamamlandı)</option>
                          <option value="overdue">🔴 Gecikti! (2. Haftadan İtibaren)</option>
                        </select>
                      </div>

                      {calculatedStatus !== 'paid' && (
                        <Button
                          size="sm"
                          onClick={() => updateGelirStatus(income.id, 'paid')}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Ödendi Olarak İşaretle
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
