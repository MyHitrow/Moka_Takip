'use client';

import { useState, useRef, useEffect } from 'react';
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
  List
} from 'lucide-react';
import { SHOOT_STATUS_LABELS, SHOOT_STATUS_COLORS } from '@/lib/constants';
import { useData } from '@/context/data-context';

export default function CekimlerPage() {
  const { cekimler, isletmeler, addCekim, deleteCekim, formatDateTr } = useData();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default Aug 2026
  const [selectedDay, setSelectedDay] = useState<number>(5);
  const [open, setOpen] = useState(false);
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylü', 'Ekim', 'Kasım', 'Aralık'
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

  const selectedDayShoots = cekimler.filter((c) => c.date === selectedDateStr);

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
                              onClick={() => deleteCekim(shoot.id)}
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
                    const dayShoots = cekimler.filter((c) => c.date === item.dateStr);

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
                                  onClick={() => deleteCekim(shoot.id)}
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
                  {cekimler.map((shoot) => (
                    <tr key={shoot.id} className="border-b border-border bg-card">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{shoot.client}</div>
                        <div className="text-xs">{shoot.title}</div>
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
                          <MapPin className="w-3 h-3 mr-2" /> {shoot.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={SHOOT_STATUS_COLORS?.[shoot.status as keyof typeof SHOOT_STATUS_COLORS] || ''}
                        >
                          {SHOOT_STATUS_LABELS?.[shoot.status as keyof typeof SHOOT_STATUS_LABELS] || shoot.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteCekim(shoot.id)}
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {cekimler.map((shoot) => (
                <Card key={shoot.id} className="bg-card border border-border p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-primary block">{shoot.client}</span>
                      <h4 className="font-extrabold text-base text-foreground">{shoot.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={SHOOT_STATUS_COLORS?.[shoot.status as keyof typeof SHOOT_STATUS_COLORS] || ''}
                      >
                        {SHOOT_STATUS_LABELS?.[shoot.status as keyof typeof SHOOT_STATUS_LABELS] || shoot.status}
                      </Badge>
                      <button
                        onClick={() => deleteCekim(shoot.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-primary" /> {formatDateTr(shoot.date)} - {shoot.time}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {shoot.location}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
