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
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function PaylasimTakvimiPage() {
  const { takvimPosts, isletmeler, addTakvimPost, deleteTakvimPost, updateTakvimPostStatus, formatDateTr } = useData();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default Aug 2026
  const [selectedDay, setSelectedDay] = useState<number>(3); // Selected day on mobile carousel
  const [mobileView, setMobileView] = useState<'carousel' | 'list'>('carousel');
  const [open, setOpen] = useState(false);

  const [client, setClient] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Instagram Reels');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [status, setStatus] = useState<'preparing' | 'ready' | 'scheduled' | 'published'>('scheduled');

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
    if (!title || !client || !date) return;
    addTakvimPost({
      client,
      title,
      platform,
      date,
      time: time || '12:00',
      status,
    });
    setTitle('');
    setClient('');
    setPlatform('Instagram Reels');
    setTime('18:00');
    setStatus('scheduled');
    setOpen(false);
  };

  const getPlatformBadgeColor = (plat: string) => {
    if (plat.includes('Reels')) return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
    if (plat.includes('Post')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (plat.includes('Story')) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (plat.includes('YouTube')) return 'bg-red-500/20 text-red-300 border-red-500/30';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const selectedMonthStr = String(month + 1).padStart(2, '0');
  const selectedDayStr = String(selectedDay).padStart(2, '0');
  const selectedDateStr = `${year}-${selectedMonthStr}-${selectedDayStr}`;

  const selectedDayPosts = takvimPosts.filter((p) => p.date === selectedDateStr);

  return (
    <div>
      <Header title="Paylaşım Takvimi" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Paylaşım Takvimi"
          subtitle="İçerik paylaşım planlaması"
          icon={CalendarDays}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" /> Yeni Paylaşım
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Paylaşım Planla</DialogTitle>
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
                    <Label htmlFor="title">İçerik Başlığı</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Kahve Tanıtım Reels"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform">Platform</Label>
                      <select
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="Instagram Reels">Instagram Reels</option>
                        <option value="Instagram Post">Instagram Post</option>
                        <option value="Instagram Story">Instagram Story</option>
                        <option value="YouTube">YouTube</option>
                        <option value="TikTok">TikTok</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Paylaşım Saati</Label>
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
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
                      <Label htmlFor="status">Durum</Label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="preparing">Hazırlanıyor</option>
                        <option value="ready">Paylaşıma Hazır</option>
                        <option value="scheduled">Planlandı</option>
                        <option value="published">Paylaşıldı</option>
                      </select>
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

        {/* ======================================================== */}
        {/* IPHONE / MOBILE PHONE CAROUSEL & CARD DESIGN (md:hidden) */}
        {/* ======================================================== */}
        <div className="block md:hidden mt-4 space-y-4">
          {/* Month & View Mode Selector */}
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

            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setMobileView('carousel')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  mobileView === 'carousel' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Günlük
              </button>
              <button
                onClick={() => setMobileView('list')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  mobileView === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                Tüm Liste
              </button>
            </div>
          </div>

              {/* iPhone Carousel Day Selector */}
              {mobileView === 'carousel' && (
                <>
                  <div className="overflow-x-auto flex gap-2 py-2 snap-x snap-mandatory scrollbar-none max-w-full">
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => {
                  const dStr = `${year}-${selectedMonthStr}-${String(d).padStart(2, '0')}`;
                  const isSelected = d === selectedDay;
                  const isToday = dStr === todayStr;
                  const postCount = takvimPosts.filter((p) => p.date === dStr).length;

                  const dayOfWeekIndex = new Date(year, month, d).getDay();
                  const dayName = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][dayOfWeekIndex];

                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`flex flex-col items-center justify-center min-w-[56px] h-16 rounded-xl border transition-all shrink-0 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary font-bold shadow-md scale-105'
                          : isToday
                          ? 'bg-primary/10 border-primary/40 text-foreground font-semibold'
                          : 'bg-card border-border text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-mono">{dayName}</span>
                      <span className="text-lg font-extrabold leading-none mt-0.5">{d}</span>
                      {postCount > 0 && (
                        <span
                          className={`text-[9px] px-1.5 rounded-full mt-1 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-primary/20 text-primary'
                          }`}
                        >
                          {postCount} Gönderi
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Header & Large Mobile Cards */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-foreground">
                    {selectedDay} {monthNames[month]} {year} Paylaşımları ({selectedDayPosts.length})
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => handleOpenAddModal(selectedDateStr)}
                    className="h-7 text-xs bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Bu Güne Ekle
                  </Button>
                </div>

                {selectedDayPosts.length === 0 ? (
                  <Card className="p-8 text-center bg-card border border-dashed border-border">
                    <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-foreground">Bu gün için paylaşım bulunmuyor.</p>
                    <p className="text-xs text-muted-foreground mt-1">İçerik planlamak için "Bu Güne Ekle" butonuna basın.</p>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {selectedDayPosts.map((post) => (
                      <Card key={post.id} className="p-4 bg-card border border-border shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-primary block">{post.client}</span>
                            <h4 className="text-base font-extrabold text-foreground mt-0.5">{post.title}</h4>
                          </div>
                          <button
                            onClick={() => deleteTakvimPost(post.id)}
                            className="text-muted-foreground hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <Badge variant="outline" className={`text-xs px-2.5 py-0.5 ${getPlatformBadgeColor(post.platform)}`}>
                            {post.platform}
                          </Badge>

                          <span className="flex items-center font-mono text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 mr-1 text-primary" /> Saat: {post.time}
                          </span>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-medium">Paylaşım Durumu:</span>
                          <select
                            value={post.status}
                            onChange={(e) => updateTakvimPostStatus(post.id, e.target.value as any)}
                            className="text-xs bg-background border border-input rounded-lg px-3 py-1.5 font-semibold text-foreground outline-none cursor-pointer"
                          >
                            <option value="preparing">Hazırlanıyor</option>
                            <option value="ready">Paylaşıma Hazır</option>
                            <option value="scheduled">Planlandı</option>
                            <option value="published">Paylaşıldı</option>
                          </select>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Full List View on Mobile */}
          {mobileView === 'list' && (
            <div className="space-y-3 pt-2">
              {takvimPosts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Kayıtlı paylaşım bulunmuyor.</p>
              ) : (
                takvimPosts.map((post) => (
                  <Card key={post.id} className="p-4 bg-card border border-border shadow-sm space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-primary">{post.client}</span>
                        <h4 className="font-extrabold text-base text-foreground">{post.title}</h4>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getPlatformBadgeColor(post.platform)}`}>
                        {post.platform}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>Tarih: {formatDateTr(post.date)} - {post.time}</span>
                      <select
                        value={post.status}
                        onChange={(e) => updateTakvimPostStatus(post.id, e.target.value as any)}
                        className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground"
                      >
                        <option value="preparing">Hazırlanıyor</option>
                        <option value="ready">Hazır</option>
                        <option value="scheduled">Planlandı</option>
                        <option value="published">Paylaşıldı</option>
                      </select>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* DESKTOP FULL MONTHLY GRID (hidden md:block)              */}
        {/* ======================================================== */}
        <div className="hidden md:block mt-6">
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
                  return <div key={`empty-${idx}`} className="bg-card/30 min-h-[110px] p-1.5" />;
                }

                const isToday = item.dateStr === todayStr;
                const dayPosts = takvimPosts.filter((p) => p.date === item.dateStr);

                return (
                  <div
                    key={item.dateStr}
                    onClick={() => handleOpenAddModal(item.dateStr)}
                    className={`bg-card min-h-[110px] p-2 flex flex-col justify-between hover:bg-accent/40 cursor-pointer transition-colors group relative ${
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
                        title="Paylaşım Ekle"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                      {dayPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={(e) => e.stopPropagation()}
                          className={`text-[11px] p-1.5 rounded border flex flex-col gap-0.5 ${getPlatformBadgeColor(
                            post.platform
                          )}`}
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="truncate max-w-[90px]">{post.client}</span>
                            <button
                              onClick={() => deleteTakvimPost(post.id)}
                              className="text-muted-foreground hover:text-red-500 p-0.5"
                              title="Sil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="truncate text-foreground font-medium">{post.title}</div>
                          <div className="flex justify-between items-center text-[10px] opacity-80 mt-0.5">
                            <span>{post.time}</span>
                            <select
                              value={post.status}
                              onChange={(e) =>
                                updateTakvimPostStatus(post.id, e.target.value as any)
                              }
                              className="bg-transparent border-0 text-[10px] p-0 font-medium cursor-pointer"
                            >
                              <option value="preparing">Hazırlanıyor</option>
                              <option value="ready">Hazır</option>
                              <option value="scheduled">Planlandı</option>
                              <option value="published">Paylaşıldı</option>
                            </select>
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
    </div>
  );
}
