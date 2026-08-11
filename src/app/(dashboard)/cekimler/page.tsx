'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Camera,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { SHOOT_STATUS_LABELS, SHOOT_STATUS_COLORS } from '@/lib/constants';
import { useData } from '@/context/data-context';
import { parseExcelFile, ParsedExcelResult, downloadSampleShootsExcelTemplate } from '@/lib/excel-importer';
import { generateSingleCekimIcal, generateBulkCekimlerIcal, downloadIcsCalendarFile } from '@/lib/ical-generator';
import { Cekim } from '@/types/app';

import { PermissionGuard } from '@/components/shared/permission-guard';
import { ConfirmDeleteModal } from '@/components/shared/confirm-delete-modal';

export default function CekimlerPage() {
  return (
    <PermissionGuard requiredPermission="canManageShoots">
      <CekimlerPageContent />
    </PermissionGuard>
  );
}

function CekimlerPageContent() {
  const { cekimler, isletmeler, addCekim, deleteCekim, updateCekimStatus, formatDateTr } = useData();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default Aug 2026
  const [selectedDay, setSelectedDay] = useState<number>(5);
  const [open, setOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carouselRef.current) {
      const selectedEl = carouselRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDay, currentDate]);


  const [client, setClient] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('planned');

  // Excel Upload State
  const [excelOpen, setExcelOpen] = useState(false);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [excelResult, setExcelResult] = useState<ParsedExcelResult | null>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingExcel(true);
    try {
      const res = await parseExcelFile(file);
      setExcelResult(res);
    } catch (err) {
      console.error('Excel parse hatası:', err);
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleConfirmImport = () => {
    if (!excelResult || excelResult.shoots.length === 0) return;
    excelResult.shoots.forEach((s) => {
      addCekim(s);
    });
    setExcelResult(null);
    setExcelOpen(false);
  };

  const handleExportSingleToAppleCalendar = (shoot: Cekim) => {
    const icsContent = generateSingleCekimIcal(shoot);
    downloadIcsCalendarFile(`cekim_${shoot.client}_${shoot.date}`, icsContent);
  };

  const handleExportAllToAppleCalendar = () => {
    if (!cekimler || cekimler.length === 0) return;
    const icsContent = generateBulkCekimlerIcal(cekimler);
    downloadIcsCalendarFile(`moka_tum_cekimler_${year}_${month + 1}`, icsContent);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDay(now.getDate());
  };

  const firstDayOfMonth = new Date(year, month, 1);
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6;

  const totalDays = new Date(year, month + 1, 0).getDate();
  const calendarDays: Array<{ day: number | null; dateStr: string }> = [];

  for (let i = 0; i < startDayIndex; i++) {
    calendarDays.push({ day: null, dateStr: '' });
  }

  for (let d = 1; d <= totalDays; d++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    calendarDays.push({ day: d, dateStr });
  }

  const handleOpenAddModal = (targetDateStr?: string) => {
    if (targetDateStr) {
      setDate(targetDateStr);
    } else {
      const selectedDayStr = String(selectedDay).padStart(2, '0');
      setDate(`${year}-${String(month + 1).padStart(2, '0')}-${selectedDayStr}`);
    }
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !title) return;
    addCekim({
      client,
      title,
      date: date || new Date().toISOString().split('T')[0],
      time: time || '12:00',
      location: location || 'Stüdyo / Müşteri Adresi',
      status,
    });
    setClient('');
    setTitle('');
    setDate('');
    setTime('10:00');
    setLocation('');
    setStatus('planned');
    setOpen(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedMonthStr = String(month + 1).padStart(2, '0');
  const selectedDayStr = String(selectedDay).padStart(2, '0');
  const selectedDateStr = `${year}-${selectedMonthStr}-${selectedDayStr}`;

  const selectedDayShoots = cekimler
    .filter((c) => c.date === selectedDateStr)
    .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

  return (
    <div>
      <Header title="Çekimler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Çekimler"
          subtitle="Çekim planlaması ve takibi"
          icon={Camera}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-muted p-1 rounded-xl flex items-center gap-1 border border-border">
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="h-8 text-xs"
                >
                  <CalendarDays className="w-3.5 h-3.5 mr-1" /> Takvim
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 text-xs"
                >
                  <List className="w-3.5 h-3.5 mr-1" /> Liste
                </Button>
              </div>

              {/* Apple Calendar Export */}
              <Button
                variant="outline"
                onClick={handleExportAllToAppleCalendar}
                className="border-red-500/40 bg-[#17181B] hover:bg-red-500/10 text-red-400 font-bold text-xs"
              >
                <Calendar className="w-4 h-4 mr-1.5 text-red-400" /> Apple Takvime Aktar (.ics)
              </Button>

              {/* Excel Upload Dialog */}
              <Dialog open={excelOpen} onOpenChange={setExcelOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" className="border-[#2B2D32] bg-[#17181B] hover:bg-[#24262B] text-[#F7F7F8] font-bold text-xs">
                      <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" /> Excel'den İçe Aktar
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] bg-[#17181B] border-[#2B2D32] text-[#F7F7F8]">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Excel / CSV'den Toplu Çekim Yükle
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center bg-[#111214] border border-[#2B2D32] p-2.5 rounded-lg text-xs">
                      <span className="text-[#B5B7BD]">Hazır Excel şablonu kullanın:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadSampleShootsExcelTemplate}
                        className="text-[11px] h-7 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold"
                      >
                        📥 Örnek Şablonu İndir (.xlsx)
                      </Button>
                    </div>

                    <p className="text-xs text-[#B5B7BD]">
                      Excel (`.xlsx`, `.xls`) veya CSV dosyanızı yükleyerek toplu çekimlerinizi saniyeler içinde takvime ekleyebilirsiniz.
                    </p>

                    <div className="border-2 border-dashed border-[#2B2D32] hover:border-emerald-500/50 rounded-xl p-6 text-center bg-[#0D0E10] transition-colors relative">
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs font-bold text-[#F7F7F8]">Excel / CSV Dosyasını Buraya Sürükleyin veya Seçin</p>
                      <p className="text-[10px] text-[#73767E] mt-1">Desteklenen: .xlsx, .xls, .csv</p>
                    </div>

                    {isParsingExcel && (
                      <div className="flex items-center justify-center gap-2 text-xs text-[#B5B7BD] py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Excel Çözümleniyor...
                      </div>
                    )}

                    {excelResult && (
                      <div className="bg-[#111214] border border-[#2B2D32] rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> {excelResult.shoots.length} Adet Çekim Tespit Edildi
                          </span>
                          <span className="text-[10px] text-[#73767E]">{excelResult.clientNamesFound.length} Farklı İşletme</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-[11px] scrollbar-thin">
                          {excelResult.shoots.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-[#1D1F23] p-2 rounded border border-[#2B2D32]">
                              <span><b>{s.client}</b> — {s.title}</span>
                              <span className="text-[#73767E] text-[10px]">{s.date} @ {s.time}</span>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={handleConfirmImport}
                          className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        >
                          Tüm Çekimleri Veritabanına Aktar ({excelResult.shoots.length})
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger
                  render={
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 mr-2" /> Yeni Çekim
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[425px] bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Yeni Çekim Planla</DialogTitle>
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
                            {isletme.name}
                          </option>
                        ))}
                        <option value="Diğer Müşteri">Diğer Müşteri</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Çekim Başlığı</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Sonbahar Menü Çekimi"
                        required
                      />
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
                        <Label htmlFor="time">Saat</Label>
                        <Input
                          id="time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Konum / Adres</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Örn: Kadıköy Şubesi"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Durum</Label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="planned">Planlandı</option>
                        <option value="ready">Çekime Hazır</option>
                        <option value="shot">Çekildi</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">İptal Edildi</option>
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

        {/* CALENDAR VIEW MODE */}
        {viewMode === 'calendar' && (
          <div className="mt-4">
            {/* iPhone / Mobile Phone Day Carousel (md:hidden) */}
            <div className="block md:hidden space-y-4">
              <div className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon-sm" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-base font-bold">
                    {monthNames[month]} {year}
                  </h2>
                  <Button variant="outline" size="icon-sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
                  Bugün
                </Button>
              </div>

              {/* Day Pills Carousel with Arrow Controls */}
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSelectedDay((prev) => Math.max(1, prev - 1))}
                  className="h-16 w-8 shrink-0 rounded-xl bg-card border-border shadow-xs"
                  title="Önceki Gün"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div
                  ref={carouselRef}
                  className="overflow-x-auto flex gap-2 py-2 snap-x snap-mandatory touch-pan-x scrollbar-none flex-1 min-w-0"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                    const dStr = `${year}-${selectedMonthStr}-${String(d).padStart(2, '0')}`;
                    const isSelected = d === selectedDay;
                    const isToday = dStr === todayStr;
                    const shootCount = cekimler.filter((c) => c.date === dStr).length;

                    const dayOfWeekIndex = new Date(year, month, d).getDay();
                    const dayName = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][dayOfWeekIndex];

                    return (
                      <button
                        key={d}
                        data-selected={isSelected}
                        onClick={() => setSelectedDay(d)}
                        className={`flex flex-col items-center justify-center min-w-[56px] h-16 rounded-xl border transition-all shrink-0 snap-center ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary font-bold shadow-md scale-105'
                            : isToday
                            ? 'bg-primary/10 border-primary/40 text-foreground font-semibold'
                            : 'bg-card border-border text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-mono">{dayName}</span>
                        <span className="text-lg font-extrabold leading-none mt-0.5">{d}</span>
                        {shootCount > 0 && (
                          <span
                            className={`text-[9px] px-1.5 rounded-full mt-1 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'
                            }`}
                          >
                            {shootCount} Çekim
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setSelectedDay((prev) => Math.min(totalDays, prev + 1))}
                  className="h-16 w-8 shrink-0 rounded-xl bg-card border-border shadow-xs"
                  title="Sonraki Gün"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Selected Day Shoots Mobile Cards */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">
                    {selectedDay} {monthNames[month]} {year} Çekimleri ({selectedDayShoots.length})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAddModal(selectedDateStr)}
                    className="h-7 text-xs bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Çekim Planla
                  </Button>
                </div>

                {selectedDayShoots.length === 0 ? (
                  <Card className="p-8 text-center bg-card border border-dashed border-border">
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-foreground">Bu gün için çekim planlanmadı.</p>
                    <p className="text-xs text-muted-foreground mt-1">Yeni çekim eklemek için yukarıdaki butona tıklayın.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedDayShoots.map((shoot) => (
                      <Card key={shoot.id} className="p-4 bg-card border border-border shadow-sm space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-primary block">{shoot.client}</span>
                            <h4 className="text-base font-extrabold text-foreground mt-0.5">{shoot.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs px-2 py-0.5 ${
                                SHOOT_STATUS_COLORS?.[shoot.status as keyof typeof SHOOT_STATUS_COLORS] || ''
                              }`}
                            >
                              {SHOOT_STATUS_LABELS?.[shoot.status as keyof typeof SHOOT_STATUS_LABELS] || shoot.status}
                            </Badge>
                             <button
                               onClick={() => setDeleteConfirmId(shoot.id)}
                               className="text-muted-foreground hover:text-red-500 p-1"
                             >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1 text-primary" /> {shoot.time}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {shoot.location}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <button
                            onClick={() => handleExportSingleToAppleCalendar(shoot)}
                            className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md transition-colors"
                            title="Apple / iOS Takvime Ekle"
                          >
                            <Calendar className="w-3 h-3 text-red-400" /> Apple Takvime Ekle
                          </button>
                          <select
                            value={shoot.status}
                            onChange={(e) => updateCekimStatus(shoot.id, e.target.value)}
                            className="text-xs bg-background border border-input rounded-lg px-2 py-1 font-semibold text-foreground outline-none cursor-pointer"
                          >
                            <option value="planned">Planlandı</option>
                            <option value="ready">Çekime Hazır</option>
                            <option value="shot">Çekildi</option>
                            <option value="files_transferred">Dosyalar Aktarıldı</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="cancelled">İptal Edildi</option>
                          </select>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Full Monthly Grid (hidden md:block) */}
            <div className="hidden md:block">
              <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">
                    {monthNames[month]} {year}
                  </h2>
                  <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
                    Bugün
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon-sm" onClick={prevMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
                  {weekDays.map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 auto-rows-fr gap-px bg-border">
                  {calendarDays.map((item, idx) => {
                    if (item.day === null) {
                      return <div key={`empty-${idx}`} className="bg-card/30 min-h-[120px] p-1.5" />;
                    }

                    const isToday = item.dateStr === todayStr;
                    const dayShoots = cekimler
                      .filter((c) => c.date === item.dateStr)
                      .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

                    return (
                      <div
                        key={item.dateStr}
                        onClick={() => handleOpenAddModal(item.dateStr)}
                        className={`bg-card min-h-[120px] p-2 flex flex-col justify-between hover:bg-accent/40 cursor-pointer transition-colors group relative ${
                          isToday ? 'ring-2 ring-primary ring-inset font-semibold' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span
                            className={`text-xs w-6 h-6 flex items-center justify-center rounded-full ${
                              isToday ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground'
                            }`}
                          >
                            {item.day}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenAddModal(item.dateStr);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity p-0.5"
                            title="Çekim Ekle"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1.5 overflow-y-auto max-h-[90px] pr-0.5">
                          {dayShoots.map((shoot) => (
                            <div
                              key={shoot.id}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] p-2 rounded-lg border bg-card/90 border-border shadow-xs flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between font-bold text-foreground">
                                <span className="truncate max-w-[90px] text-primary">{shoot.client}</span>
                                 <button
                                   onClick={() => setDeleteConfirmId(shoot.id)}
                                   className="text-muted-foreground hover:text-red-500 p-0.5"
                                   title="Sil"
                                 >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="truncate text-foreground font-medium">{shoot.title}</div>

                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-0.5">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1 text-muted-foreground" />
                                  {shoot.time}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 ${
                                    SHOOT_STATUS_COLORS?.[shoot.status as keyof typeof SHOOT_STATUS_COLORS] || ''
                                  }`}
                                >
                                  {SHOOT_STATUS_LABELS?.[shoot.status as keyof typeof SHOOT_STATUS_LABELS] || shoot.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW MODE */}
        {viewMode === 'list' && (
          <div className="mt-6">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 rounded-tl-lg">Müşteri / Başlık</th>
                    <th className="px-6 py-3">Tarih & Saat</th>
                    <th className="px-6 py-3">Konum</th>
                    <th className="px-6 py-3">Durum</th>
                    <th className="px-6 py-3 rounded-tr-lg text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const sortedShoots = [...cekimler].sort((a, b) => {
                      const da = `${a.date}T${(a.time || '00:00').padStart(5, '0')}`;
                      const db = `${b.date}T${(b.time || '00:00').padStart(5, '0')}`;
                      return da.localeCompare(db);
                    });

                    return sortedShoots.map((shoot, idx) => {
                      const isNewDay = idx > 0 && shoot.date !== sortedShoots[idx - 1].date;

                      return (
                        <React.Fragment key={shoot.id}>
                          {isNewDay && (
                            <tr className="bg-transparent">
                              <td colSpan={5} className="py-2.5 px-0">
                                <div className="flex items-center gap-3 my-1">
                                  <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/10" />
                                  <span className="text-[11px] font-extrabold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30 flex items-center gap-1.5 shadow-xs">
                                    <Calendar className="w-3.5 h-3.5" /> {formatDateTr(shoot.date)}
                                  </span>
                                  <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/80" />
                                </div>
                              </td>
                            </tr>
                          )}
                          <tr className="border-b border-border bg-card hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-foreground">{shoot.client}</div>
                              <div className="text-xs text-muted-foreground">{shoot.title}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-2 text-primary" /> {formatDateTr(shoot.date)}
                              </div>
                              <div className="flex items-center mt-1">
                                <Clock className="w-3 h-3 mr-2 text-muted-foreground" /> {shoot.time}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-2 text-muted-foreground" /> {shoot.location}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={shoot.status}
                                onChange={(e) => updateCekimStatus(shoot.id, e.target.value)}
                                className="text-xs bg-background border border-input rounded-md px-2.5 py-1 text-foreground cursor-pointer font-semibold outline-none"
                              >
                                <option value="planned">Planlandı</option>
                                <option value="ready">Çekime Hazır</option>
                                <option value="shot">Çekildi</option>
                                <option value="files_transferred">Dosyalar Aktarıldı</option>
                                <option value="completed">Tamamlandı</option>
                                <option value="cancelled">İptal Edildi</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-right">
                               <button
                                 onClick={() => setDeleteConfirmId(shoot.id)}
                                 className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                 title="Sil"
                               >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {(() => {
                const sortedShoots = [...cekimler].sort((a, b) => {
                  const da = `${a.date}T${(a.time || '00:00').padStart(5, '0')}`;
                  const db = `${b.date}T${(b.time || '00:00').padStart(5, '0')}`;
                  return da.localeCompare(db);
                });

                return sortedShoots.map((shoot, idx) => {
                  const isNewDay = idx > 0 && shoot.date !== sortedShoots[idx - 1].date;

                  return (
                    <React.Fragment key={shoot.id}>
                      {isNewDay && (
                        <div className="flex items-center gap-3 pt-3 pb-1">
                          <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/10" />
                          <span className="text-[11px] font-extrabold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/30 flex items-center gap-1.5 shadow-xs">
                            <Calendar className="w-3.5 h-3.5" /> {formatDateTr(shoot.date)}
                          </span>
                          <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/80" />
                        </div>
                      )}
                      <Card className="bg-card border border-border p-4 shadow-sm space-y-2">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <span className="text-xs font-bold text-primary block">{shoot.client}</span>
                            <h4 className="font-extrabold text-base text-foreground">{shoot.title}</h4>
                          </div>
                          <button
                            onClick={() => setDeleteConfirmId(shoot.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1 text-primary" /> {formatDateTr(shoot.date)} - {shoot.time}
                          </span>
                          <span className="flex items-center truncate max-w-[150px]">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground shrink-0" /> {shoot.location}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Durum:</span>
                          <select
                            value={shoot.status}
                            onChange={(e) => updateCekimStatus(shoot.id, e.target.value)}
                            className="text-xs bg-background border border-input rounded-lg px-2 py-1 font-semibold text-foreground outline-none cursor-pointer"
                          >
                            <option value="planned">Planlandı</option>
                            <option value="ready">Çekime Hazır</option>
                            <option value="shot">Çekildi</option>
                            <option value="files_transferred">Dosyalar Aktarıldı</option>
                            <option value="completed">Tamamlandı</option>
                            <option value="cancelled">İptal Edildi</option>
                          </select>
                        </div>
                      </Card>
                    </React.Fragment>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteConfirmId}
        onOpenChange={(op) => { if (!op) setDeleteConfirmId(null); }}
        title="Çekim Kaydını Sil"
        description="Bu çekim kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteCekim(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
      />
    </div>
  );
}
