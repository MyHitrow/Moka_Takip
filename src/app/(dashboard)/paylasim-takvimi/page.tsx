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
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, Video } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function PaylasimTakvimiPage() {
  const { takvimPosts, isletmeler, addTakvimPost, deleteTakvimPost, updateTakvimPostStatus } = useData();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1)); // Default Aug 2026
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
    setCurrentDate(new Date());
  };

  // Monthly calendar grid calculation
  const firstDayOfMonth = new Date(year, month, 1);
  let startDayIndex = firstDayOfMonth.getDay() - 1;
  if (startDayIndex === -1) startDayIndex = 6; // Sunday -> 6

  const totalDays = new Date(year, month + 1, 0).getDate();

  const calendarDays: Array<{ day: number | null; dateStr: string }> = [];

  // Trailing empty days from previous month
  for (let i = 0; i < startDayIndex; i++) {
    calendarDays.push({ day: null, dateStr: '' });
  }

  // Days of current month
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
      setDate(`${year}-${String(month + 1).padStart(2, '0')}-01`);
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
    if (plat.includes('Reels')) return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    if (plat.includes('Post')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (plat.includes('Story')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (plat.includes('YouTube')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };

  const getStatusLabel = (st: string) => {
    switch (st) {
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Paylaşıma Hazır';
      case 'scheduled': return 'Planlandı';
      case 'published': return 'Paylaşıldı';
      default: return st;
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      <Header title="Paylaşım Takvimi" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Paylaşım Takvimi"
          subtitle="İçerik paylaşım planlaması (Aylık Takvim)"
          icon={CalendarDays}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90">
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

        {/* Monthly Calendar Header Controls */}
        <div className="mt-6 flex items-center justify-between bg-card border border-border rounded-xl p-4 mb-6">
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

        {/* Monthly Calendar Grid */}
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-semibold text-muted-foreground py-2.5">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
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
  );
}
