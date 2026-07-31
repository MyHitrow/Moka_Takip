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
import { TrendingUp, Wallet, ArrowUpRight, AlertCircle, Trash2, Plus, CheckCircle2, RefreshCw, Calendar, Clock, DollarSign, PieChart } from 'lucide-react';
import { useData, Gelir } from '@/context/data-context';

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
  let defaultMonthIndex = now.getMonth(); // 0-11
  let defaultYear = now.getFullYear();

  // Rule: Starting on the 27th day of the month, default view becomes NEXT MONTH!
  if (now.getDate() >= 27) {
    defaultMonthIndex += 1;
    if (defaultMonthIndex > 11) {
      defaultMonthIndex = 0;
      defaultYear += 1;
    }
  }

  const defaultMonthKey = String(defaultMonthIndex + 1).padStart(2, '0');

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonthKey);
  const [selectedYear, setSelectedYear] = useState<string>(String(defaultYear));
  const [open, setOpen] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState('');

  // Partial Payment Modal State
  const [partialModalOpen, setPartialModalOpen] = useState(false);
  const [selectedGelirForPartial, setSelectedGelirForPartial] = useState<Gelir | null>(null);
  const [inputPartialAmount, setInputPartialAmount] = useState<string>('');

  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !amount) return;

    const selectedMonthObj = MONTHS_TR.find((m) => m.key === selectedMonth);
    const monthName = selectedMonthObj ? selectedMonthObj.name : '';

    addGelir({
      client,
      description: description || `${monthName} Ayı Paket Ücreti`,
      amount: parseFloat(amount) || 0,
      date: date || `${selectedYear}-${selectedMonth}-05`,
      status,
    });
    setClient('');
    setDescription('');
    setAmount('');
    setDate('');
    setStatus('pending');
    setOpen(false);
  };

  const handleGenerateMonthly = async () => {
    const targetMonthStr = `${selectedYear}-${selectedMonth}`;
    const count = await generateMonthlyIncomes(targetMonthStr);
    const selectedMonthName = MONTHS_TR.find((m) => m.key === selectedMonth)?.name;

    if (count > 0) {
      setGeneratedMsg(`${selectedMonthName} ${selectedYear} ayı için ${count} adet aktif işletmenin tahsilat fişi başarıyla oluşturuldu!`);
    } else {
      setGeneratedMsg(`${selectedMonthName} ${selectedYear} ayı için tüm aktif işletmelerin tahsilat fişleri zaten mevcut.`);
    }
    setTimeout(() => setGeneratedMsg(''), 4000);
  };

  // Open Partial Payment Modal
  const handleOpenPartialModal = (income: Gelir) => {
    setSelectedGelirForPartial(income);
    setInputPartialAmount(income.paidAmount ? String(income.paidAmount) : '');
    setPartialModalOpen(true);
  };

  const handleSavePartialPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGelirForPartial) return;

    const numPartial = parseFloat(inputPartialAmount) || 0;
    if (numPartial >= selectedGelirForPartial.amount) {
      updateGelirStatus(selectedGelirForPartial.id, 'paid');
    } else if (numPartial > 0) {
      updateGelirStatus(selectedGelirForPartial.id, 'partial', numPartial);
    } else {
      updateGelirStatus(selectedGelirForPartial.id, 'pending', 0);
    }

    setPartialModalOpen(false);
    setSelectedGelirForPartial(null);
    setInputPartialAmount('');
  };

  // CALCULATE STATUS ACCORDING TO USER'S EXACT RULES:
  // - Paid: GREEN "Tahsil Edildi (Ödendi)"
  // - Partial: ORANGE "Kısmi Ödeme Yapıldı"
  // - Days 1 to 7: YELLOW "Bekliyor (Ayın İlk Haftası)"
  // - Day 8 onwards (after 7th): RED "Gecikti! (Vadesi Geçti)"
  const getItemStatus = (income: Gelir) => {
    if (income.status === 'paid') return 'paid';
    if (income.status === 'partial' || (income.paidAmount && income.paidAmount > 0 && income.paidAmount < income.amount)) {
      return 'partial';
    }

    const parts = income.date.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;

      const currentYear = now.getFullYear();
      const currentMonthIndex = now.getMonth();
      const currentDay = now.getDate();

      // Past months -> Always RED Gecikti!
      if (year < currentYear || (year === currentYear && monthIndex < currentMonthIndex)) {
        return 'overdue';
      }

      // Current month:
      if (year === currentYear && monthIndex === currentMonthIndex) {
        // Day 1 to 7: YELLOW Bekliyor
        // Day 8+: RED Gecikti!
        if (currentDay > 7) {
          return 'overdue';
        }
        return 'pending';
      }

      // Future month: YELLOW Bekliyor
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

  // GREEN: Full Paid Incomes
  const totalPaidFull = filteredGelirler
    .filter((g) => g.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // ORANGE: Partial Amount Collected
  const totalPartialPaid = filteredGelirler
    .reduce((acc, curr) => {
      if (curr.status === 'partial' || (curr.paidAmount && curr.paidAmount > 0 && curr.status !== 'paid')) {
        return acc + (curr.paidAmount || 0);
      }
      return acc;
    }, 0);

  // Total Collected (Full + Partial)
  const totalCollectedSoFar = totalPaidFull + totalPartialPaid;

  // YELLOW: Pending Incomes Remaining Balance (1st Week - Days 1 to 7)
  const totalPendingWeek1 = filteredGelirler
    .filter((g) => g.status !== 'paid' && getItemStatus(g) === 'pending')
    .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);

  // RED: Overdue Incomes Remaining Balance (After Day 7 / Past months)
  const totalOverdueWeek2 = filteredGelirler
    .filter((g) => g.status !== 'paid' && getItemStatus(g) === 'overdue')
    .reduce((acc, curr) => acc + (curr.amount - (curr.paidAmount || 0)), 0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);

  return (
    <div>
      <Header title="Gelirler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Gelirler & 12 Aylık Tahsilat Takvimi"
          subtitle="Tek işletmeden tek ayda 1 defa tahsilat yazılır (Çakışma ve mükerrer kayıt engellendi)"
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
                        <option value="pending">🟡 Bekliyor (Ayın 1-7. Günleri)</option>
                        <option value="partial">🟠 Kısmi Ödeme Yapıldı</option>
                        <option value="paid">🟢 Ödendi (Tamamlandı)</option>
                        <option value="overdue">🔴 Gecikti (7. Günden Sonra)</option>
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
              <Calendar className="w-4 h-4 text-primary" /> 12 Aylık Tahsilat Takvimi (27'sinden Sonra Gelecek Ay Listelenir)
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
              const isDefaultMonth = defaultMonthKey === m.key;

              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMonth(m.key)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-extrabold transition-all flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-primary text-white shadow-md red-glow'
                      : isDefaultMonth
                      ? 'bg-primary/20 text-primary border border-primary/40 font-black'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <span>{m.name}</span>
                  {isDefaultMonth && (
                    <span className="text-[9px] text-primary opacity-90 font-mono font-bold mt-0.5">Aktif Dönem</span>
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
          {/* STAT CARDS: BLUE (TOPLAM), GREEN (ÖDENDİ), ORANGE (KISMİ ÖDEME), YELLOW (BEKLEYEN 1-7. GÜN), RED (GECİKEN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Beklenen Toplam */}
            <Card className="p-4 bg-card border border-border flex items-center shadow-xs">
              <div className="bg-blue-500/10 p-2.5 rounded-full mr-3 shrink-0 border border-blue-500/20">
                <Wallet className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-semibold">Toplam Anlaşma</p>
                <h3 className="text-lg font-extrabold text-foreground">{formatCurrency(totalExpected)}</h3>
              </div>
            </Card>

            {/* 2. Toplam Alınan (YEŞİL) */}
            <Card className="p-4 bg-card border border-emerald-500/30 bg-emerald-500/5 flex items-center shadow-xs">
              <div className="bg-emerald-500/20 p-2.5 rounded-full mr-3 shrink-0 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[11px] text-emerald-300 font-bold">🟢 Toplam Tahsil Edilen</p>
                <h3 className="text-lg font-extrabold text-emerald-400">{formatCurrency(totalCollectedSoFar)}</h3>
              </div>
            </Card>

            {/* 3. Kısmi Ödemeler (TURUNCU) */}
            <Card className="p-4 bg-card border border-orange-500/30 bg-orange-500/5 flex items-center shadow-xs">
              <div className="bg-orange-500/20 p-2.5 rounded-full mr-3 shrink-0 border border-orange-500/40">
                <PieChart className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-[11px] text-orange-300 font-bold">🟠 Kısmi Alınan Tutar</p>
                <h3 className="text-lg font-extrabold text-orange-400">{formatCurrency(totalPartialPaid)}</h3>
              </div>
            </Card>

            {/* 4. Beklemede Kalan (SARI - 1-7. GÜNLER) */}
            <Card className="p-4 bg-card border border-amber-500/30 bg-amber-500/5 flex items-center shadow-xs">
              <div className="bg-amber-500/20 p-2.5 rounded-full mr-3 shrink-0 border border-amber-500/40">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-[11px] text-amber-300 font-bold">🟡 Bekleyen (1-7. Gün)</p>
                <h3 className="text-lg font-extrabold text-amber-400">{formatCurrency(totalPendingWeek1)}</h3>
              </div>
            </Card>

            {/* 5. Gecikmede Kalan (KIRMIZI - 7. GÜNDEN SONRA) */}
            <Card className="p-4 bg-card border border-red-500/30 bg-red-500/5 flex items-center shadow-xs">
              <div className="bg-red-500/20 p-2.5 rounded-full mr-3 shrink-0 border border-red-500/40">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-[11px] text-red-300 font-bold">🔴 Geciken (7+ Gün)</p>
                <h3 className="text-lg font-extrabold text-red-400">{formatCurrency(totalOverdueWeek2)}</h3>
              </div>
            </Card>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground font-bold">
                <tr>
                  <th className="px-6 py-3 rounded-tl-lg">Müşteri / Açıklama</th>
                  <th className="px-6 py-3">Paket Tutarı</th>
                  <th className="px-6 py-3">Ödenen / Kalan</th>
                  <th className="px-6 py-3">Vade Tarihi</th>
                  <th className="px-6 py-3">Tahsilat Durumu</th>
                  <th className="px-6 py-3 rounded-tr-lg text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {filteredGelirler.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground font-semibold">
                      Bu ay için henüz tahsilat kaydı bulunmuyor. *"Seçili Ay İçin Fişleri Oluştur"* butonuna basarak ekleyebilirsiniz.
                    </td>
                  </tr>
                ) : (
                  filteredGelirler.map((income) => {
                    const calculatedStatus = getItemStatus(income);
                    const isPaid = calculatedStatus === 'paid';
                    const isPartial = calculatedStatus === 'partial';
                    const isOverdue = calculatedStatus === 'overdue';

                    const paidAmt = isPaid ? income.amount : (income.paidAmount || 0);
                    const remainingAmt = Math.max(0, income.amount - paidAmt);

                    return (
                      <tr
                        key={income.id}
                        className={`border-b border-border transition-colors ${
                          isPaid
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/15'
                            : isPartial
                            ? 'bg-orange-500/10 hover:bg-orange-500/15'
                            : isOverdue
                            ? 'bg-red-500/10 hover:bg-red-500/15'
                            : 'bg-amber-500/10 hover:bg-amber-500/15'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`font-extrabold text-base ${isPaid ? 'text-emerald-300' : isPartial ? 'text-orange-300' : isOverdue ? 'text-red-300' : 'text-amber-300'}`}>
                            {income.client}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{income.description}</div>
                        </td>
                        <td className="px-6 py-4 font-extrabold text-foreground text-base font-mono">
                          {formatCurrency(income.amount)}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {isPaid ? (
                            <span className="text-emerald-400 font-bold">✓ Tamamı Ödendi</span>
                          ) : isPartial ? (
                            <div>
                              <span className="text-orange-400 font-bold block">Ödenen: {formatCurrency(paidAmt)}</span>
                              <span className="text-amber-300 font-bold block text-[11px]">Kalan: {formatCurrency(remainingAmt)}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Kalan: {formatCurrency(income.amount)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {formatDateTr(income.date)}
                          {isOverdue && (
                            <span className="block text-[10px] text-red-400 font-extrabold mt-0.5">
                              🔴 7. Günden Sonra Gecikmede!
                            </span>
                          )}
                          {!isOverdue && !isPaid && !isPartial && (
                            <span className="block text-[10px] text-amber-400 font-bold mt-0.5">
                              🟡 Ayın 1-7. Günleri Beklemede
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            <select
                              value={calculatedStatus}
                              onChange={(e) => {
                                const newSt = e.target.value;
                                if (newSt === 'partial') {
                                  handleOpenPartialModal(income);
                                } else {
                                  updateGelirStatus(income.id, newSt);
                                }
                              }}
                              className={`text-xs font-extrabold rounded-lg px-2.5 py-1.5 border cursor-pointer outline-none transition-colors ${
                                isPaid
                                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50'
                                  : isPartial
                                  ? 'bg-orange-500/25 text-orange-300 border-orange-500/50 font-black'
                                  : isOverdue
                                  ? 'bg-red-500/25 text-red-300 border-red-500/50'
                                  : 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                              }`}
                            >
                              <option value="pending" className="bg-card text-foreground">🟡 Bekliyor (Ayın 1-7. Günleri)</option>
                              <option value="partial" className="bg-card text-foreground">🟠 Kısmi Ödeme Yapıldı</option>
                              <option value="paid" className="bg-card text-foreground">🟢 Ödendi (Tahsil Edildi)</option>
                              <option value="overdue" className="bg-card text-foreground">🔴 Gecikti! (7. Günden Sonra)</option>
                            </select>

                            {!isPaid && (
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenPartialModal(income)}
                                  className="h-8 text-xs bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30 font-bold"
                                >
                                  🟠 Kısmi Tutar Gir
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateGelirStatus(income.id, 'paid')}
                                  className="h-8 text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 font-bold"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Tam Ödendi
                                </Button>
                              </div>
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
                const isPaid = calculatedStatus === 'paid';
                const isPartial = calculatedStatus === 'partial';
                const isOverdue = calculatedStatus === 'overdue';

                const paidAmt = isPaid ? income.amount : (income.paidAmount || 0);
                const remainingAmt = Math.max(0, income.amount - paidAmt);

                return (
                  <Card
                    key={income.id}
                    className={`p-4 border ${
                      isPaid
                        ? 'bg-emerald-500/10 border-emerald-500/40'
                        : isPartial
                        ? 'bg-orange-500/10 border-orange-500/40'
                        : isOverdue
                        ? 'bg-red-500/10 border-red-500/40'
                        : 'bg-amber-500/10 border-amber-500/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`font-extrabold text-base ${isPaid ? 'text-emerald-300' : isPartial ? 'text-orange-300' : isOverdue ? 'text-red-300' : 'text-amber-300'}`}>
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

                    <div className="my-3 pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Toplam Anlaşma</span>
                        <span className="text-base font-extrabold text-foreground font-mono">{formatCurrency(income.amount)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">Ödenen / Kalan</span>
                        {isPaid ? (
                          <span className="text-xs text-emerald-400 font-bold block">Tam Ödendi</span>
                        ) : isPartial ? (
                          <div>
                            <span className="text-xs text-orange-400 font-bold block">Öd: {formatCurrency(paidAmt)}</span>
                            <span className="text-[11px] text-amber-300 font-bold block">Kal: {formatCurrency(remainingAmt)}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">Kal: {formatCurrency(income.amount)}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-bold">Durum:</span>
                        <select
                          value={calculatedStatus}
                          onChange={(e) => {
                            const newSt = e.target.value;
                            if (newSt === 'partial') {
                              handleOpenPartialModal(income);
                            } else {
                              updateGelirStatus(income.id, newSt);
                            }
                          }}
                          className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-bold outline-none"
                        >
                          <option value="pending">🟡 Bekliyor (Ayın 1-7. Günleri)</option>
                          <option value="partial">🟠 Kısmi Ödeme Yapıldı</option>
                          <option value="paid">🟢 Ödendi (Tahsil Edildi)</option>
                          <option value="overdue">🔴 Gecikti! (7. Günden Sonra)</option>
                        </select>
                      </div>

                      {!isPaid && (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenPartialModal(income)}
                            className="bg-orange-500/20 text-orange-300 border-orange-500/40 hover:bg-orange-500/30 text-xs font-bold h-8"
                          >
                            🟠 Kısmi Tutar Gir
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateGelirStatus(income.id, 'paid')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-bold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Tam Ödendi
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* 🟠 PARTIAL PAYMENT INPUT MODAL DIALOG */}
        <Dialog open={partialModalOpen} onOpenChange={setPartialModalOpen}>
          <DialogContent className="sm:max-w-[400px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-400 font-extrabold">
                <PieChart className="w-5 h-5 text-orange-400" /> Kısmi Ödeme Tutarı Gir
              </DialogTitle>
            </DialogHeader>

            {selectedGelirForPartial && (
              <form onSubmit={handleSavePartialPayment} className="space-y-4 pt-2">
                <div className="p-3 bg-muted/40 rounded-xl border border-border space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground">Müşteri:</span>
                    <span className="text-foreground">{selectedGelirForPartial.client}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-muted-foreground">Toplam Paket Ücreti:</span>
                    <span className="text-foreground font-mono">{formatCurrency(selectedGelirForPartial.amount)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partialAmtInput" className="font-bold text-orange-300">Alınan Kısmi Tutar (TL)</Label>
                  <div className="relative">
                    <Input
                      id="partialAmtInput"
                      type="number"
                      value={inputPartialAmount}
                      onChange={(e) => setInputPartialAmount(e.target.value)}
                      placeholder="Örn: 10000"
                      className="pl-8 font-mono text-base font-bold text-orange-300 border-orange-500/40 bg-orange-500/5 focus:border-orange-500"
                      required
                      autoFocus
                    />
                    <DollarSign className="w-4 h-4 text-orange-400 absolute left-2.5 top-3" />
                  </div>
                </div>

                {inputPartialAmount && parseFloat(inputPartialAmount) > 0 && (
                  <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/30 text-xs space-y-1 animate-fade-in font-bold">
                    <div className="flex justify-between text-orange-300">
                      <span>Alınan Tutar:</span>
                      <span className="font-mono">{formatCurrency(parseFloat(inputPartialAmount))}</span>
                    </div>
                    <div className="flex justify-between text-amber-300 font-extrabold border-t border-orange-500/20 pt-1">
                      <span>Kalan Bakiye:</span>
                      <span className="font-mono">
                        {formatCurrency(Math.max(0, selectedGelirForPartial.amount - parseFloat(inputPartialAmount)))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPartialModalOpen(false)}
                    className="text-xs"
                  >
                    Vazgeç
                  </Button>

                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold"
                  >
                    Kısmi Ödemeyi Kaydet
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
