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
import {
  Film,
  Calendar,
  User,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Video,
  Eye,
  Send,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useData } from '@/context/data-context';

const CARDS_PER_SLIDE = 3;

export default function EditlerPage() {
  const { editler, ekip, systemUsers, isletmeler, addEdit, deleteEdit, updateEditStatus, formatDateTr } = useData();
  const [open, setOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState<'pending' | 'completed'>('pending');

  const [title, setTitle] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [type, setType] = useState('Reels');
  const [editor, setEditor] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('editing');

  // Carousel slide indexes
  const [editingSlide, setEditingSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);
  const [completedSlide, setCompletedSlide] = useState(0);

  const finalClientName = selectedClient === '__CUSTOM__' ? customClient : selectedClient;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !finalClientName.trim()) return;
    addEdit({
      title,
      client: finalClientName.trim(),
      type,
      editor: editor || 'Atanmadı',
      deadline: deadline || 'Belirtilmedi',
      status,
    });
    setTitle('');
    setSelectedClient('');
    setCustomClient('');
    setType('Reels');
    setEditor('');
    setDeadline('');
    setStatus('editing');
    setOpen(false);
  };

  // Combine team members and system users for dropdown assignment
  const availableEditors = Array.from(
    new Set([
      ...ekip.map((m) => m.name),
      ...systemUsers.map((u) => u.name),
    ])
  );

  const activeIsletmeler = isletmeler.filter((i) => i.active !== false);
  const passiveIsletmeler = isletmeler.filter((i) => i.active === false);

  const pendingEdits = editler.filter((e) => e.status !== 'ready' && e.status !== 'published');
  const completedEdits = editler.filter((e) => e.status === 'ready' || e.status === 'published');

  const editingEdits = editler.filter((e) => e.status === 'editing' || e.status === 'waiting');
  const reviewEdits = editler.filter((e) => e.status === 'client_review');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper for slicing carousel cards (3 cards per slide)
  const getSlideItems = <T,>(items: T[], slideIndex: number): T[] => {
    const start = slideIndex * CARDS_PER_SLIDE;
    return items.slice(start, start + CARDS_PER_SLIDE);
  };

  const getSlideCount = (totalItems: number) => Math.max(1, Math.ceil(totalItems / CARDS_PER_SLIDE));

  return (
    <div>
      <Header title="Editler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Editler & Kurgu Yönetimi"
          subtitle="Kurguda, onayda ve paylaşıma hazır içerik süreci"
          icon={Film}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90 font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Yeni Edit Görevi Ekle
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[440px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" /> Yeni Edit Görevi Ekle & Editör Atama
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  {/* Business Selector Dropdown */}
                  <div className="space-y-2">
                    <Label htmlFor="clientSelect" className="flex items-center gap-1.5 font-bold">
                      <Building2 className="w-4 h-4 text-primary" /> Müşteri / İşletme Seçin
                    </Label>
                    <select
                      id="clientSelect"
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground font-semibold cursor-pointer focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">İşletme Seçiniz...</option>
                      <optgroup label="Aktif İşletmeler">
                        {activeIsletmeler.map((isl) => (
                          <option key={isl.id} value={isl.name}>
                            🏢 {isl.name}
                          </option>
                        ))}
                        {passiveIsletmeler.map((isl) => (
                          <option key={isl.id} value={isl.name}>
                            ⚪ {isl.name} (Pasif)
                          </option>
                        ))}
                      </optgroup>
                      <option value="__CUSTOM__">✍️ Harici / Diğer İşletme (Manuel Yaz)</option>
                    </select>

                    {/* Manual Client Input if __CUSTOM__ selected */}
                    {selectedClient === '__CUSTOM__' && (
                      <Input
                        value={customClient}
                        onChange={(e) => setCustomClient(e.target.value)}
                        placeholder="Harici işletme adını girin..."
                        className="mt-2 bg-background border-primary/50"
                        required
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-bold">İçerik Başlığı</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Tanıtım Reels #1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editorSelect" className="font-bold">Editör / Ekip Üyesi Atayın</Label>
                    <select
                      id="editorSelect"
                      value={editor}
                      onChange={(e) => setEditor(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground font-medium"
                    >
                      <option value="">Editör Seçin (Atanmadı)</option>
                      {availableEditors.map((ed) => (
                        <option key={ed} value={ed}>
                          👤 {ed}
                        </option>
                      ))}
                      <option value="Dış Editör">🌐 Dış Freelance Editör</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="font-bold">İçerik Tipi</Label>
                      <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                      >
                        <option value="Reels">Reels</option>
                        <option value="Post">Post</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Story">Story</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="font-bold">Son Teslim Tarihi</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="font-bold">Başlangıç Aşaması</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
                    >
                      <option value="editing">🎬 Kurguda (Yapılıyor)</option>
                      <option value="client_review">👀 Müşteri Onayında</option>
                      <option value="ready">🚀 Onaylandı (Paylaşıma Hazır)</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold text-base h-11">
                    Kaydet ve Görevlendir
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Category Split Tabs: Yapılması Gerekenler vs Bitenler */}
        <div className="mt-6 flex items-center gap-2 bg-card border border-border p-1.5 rounded-xl max-w-lg">
          <button
            onClick={() => setMainCategory('pending')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              mainCategory === 'pending'
                ? 'bg-primary text-primary-foreground shadow-md red-glow'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Clock className="w-4 h-4" /> Yapılması Gereken Editler ({pendingEdits.length})
          </button>
          <button
            onClick={() => setMainCategory('completed')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              mainCategory === 'completed'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Send className="w-4 h-4" /> Paylaşıma Hazır / Bitenler ({completedEdits.length})
          </button>
        </div>

        {/* VIEW 1: Yapılması Gereken Editler (🎬 Kurguda & 👀 Müşteri Onayında) — 3'lü Carousel Slider */}
        {mainCategory === 'pending' && (
          <div className="mt-6 space-y-8">
            {/* Section 1: 🎬 Kurguda / Yapılıyor */}
            <div className="bg-card/60 rounded-2xl p-5 border border-border shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Video className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">1. Kurguda / Yapılıyor</h3>
                    <p className="text-xs text-muted-foreground">Kurgu ve montaj aşamasındaki içerikler</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs font-mono font-extrabold px-2.5 py-1">
                    {editingEdits.length} Edit
                  </Badge>
                  {getSlideCount(editingEdits.length) > 1 && (
                    <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl">
                      <button
                        onClick={() => setEditingSlide((p) => Math.max(0, p - 1))}
                        disabled={editingSlide === 0}
                        className="p-1 rounded-lg hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Önceki 3 Edit"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold font-mono px-2 text-muted-foreground">
                        {editingSlide + 1} / {getSlideCount(editingEdits.length)}
                      </span>
                      <button
                        onClick={() =>
                          setEditingSlide((p) => Math.min(getSlideCount(editingEdits.length) - 1, p + 1))
                        }
                        disabled={editingSlide >= getSlideCount(editingEdits.length) - 1}
                        className="p-1 rounded-lg hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Sonraki 3 Edit"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Card Grid Slide */}
              {editingEdits.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2">
                  <Video className="w-8 h-8 opacity-40" />
                  <span>Kurguda olan edit bulunmuyor.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSlideItems(editingEdits, editingSlide).map((card) => {
                    const isDueToday = card.deadline === todayStr;
                    const isOverdue = card.deadline < todayStr;

                    return (
                      <Card
                        key={card.id}
                        className={`p-4 bg-card border transition-all shadow-xs flex flex-col justify-between ${
                          isDueToday || isOverdue
                            ? 'border-primary/70 red-border-left bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-extrabold text-primary flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {card.client}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold">{card.type}</Badge>
                              <button
                                onClick={() => deleteEdit(card.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-extrabold text-base mb-2 text-foreground line-clamp-2">{card.title}</h4>

                          {(isDueToday || isOverdue) && (
                            <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{isDueToday ? 'Bugün Yapılması Gerekiyor!' : 'Teslim Tarihi Gecikti!'}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-border space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center font-bold text-foreground">
                              <User className="w-3.5 h-3.5 mr-1 text-primary" /> {card.editor}
                            </div>
                            <div className="flex items-center font-mono font-semibold">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {formatDateTr(card.deadline)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[11px] text-muted-foreground font-bold">Aşama:</span>
                            <select
                              value={card.status}
                              onChange={(e) => updateEditStatus(card.id, e.target.value)}
                              className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-extrabold outline-none cursor-pointer"
                            >
                              <option value="editing">🎬 Kurguda (Yapılıyor)</option>
                              <option value="client_review">👀 Müşteri Onayında</option>
                              <option value="ready">🚀 Onaylandı ➔ (Paylaşıma Hazır'a Gönder)</option>
                            </select>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: 👀 Müşteri Onayında */}
            <div className="bg-card/60 rounded-2xl p-5 border border-border shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/10 p-2 rounded-xl">
                    <Eye className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">2. Müşteri Onayında</h3>
                    <p className="text-xs text-muted-foreground">Müşteriye gönderilmiş onay bekleyen editler</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs font-mono font-extrabold px-2.5 py-1">
                    {reviewEdits.length} Edit
                  </Badge>
                  {getSlideCount(reviewEdits.length) > 1 && (
                    <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl">
                      <button
                        onClick={() => setReviewSlide((p) => Math.max(0, p - 1))}
                        disabled={reviewSlide === 0}
                        className="p-1 rounded-lg hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Önceki 3 Edit"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-bold font-mono px-2 text-muted-foreground">
                        {reviewSlide + 1} / {getSlideCount(reviewEdits.length)}
                      </span>
                      <button
                        onClick={() =>
                          setReviewSlide((p) => Math.min(getSlideCount(reviewEdits.length) - 1, p + 1))
                        }
                        disabled={reviewSlide >= getSlideCount(reviewEdits.length) - 1}
                        className="p-1 rounded-lg hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Sonraki 3 Edit"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-Card Grid Slide */}
              {reviewEdits.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2">
                  <Eye className="w-8 h-8 opacity-40" />
                  <span>Müşteri onayında olan edit bulunmuyor.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSlideItems(reviewEdits, reviewSlide).map((card) => {
                    const isDueToday = card.deadline === todayStr;
                    const isOverdue = card.deadline < todayStr;

                    return (
                      <Card
                        key={card.id}
                        className={`p-4 bg-card border transition-all shadow-xs flex flex-col justify-between ${
                          isDueToday || isOverdue
                            ? 'border-amber-500/70 bg-amber-500/5'
                            : 'border-border hover:border-amber-500/40'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-extrabold text-amber-500 flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {card.client}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold">{card.type}</Badge>
                              <button
                                onClick={() => deleteEdit(card.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-extrabold text-base mb-2 text-foreground line-clamp-2">{card.title}</h4>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center font-bold text-foreground">
                              <User className="w-3.5 h-3.5 mr-1 text-amber-500" /> {card.editor}
                            </div>
                            <div className="flex items-center font-mono font-semibold">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {formatDateTr(card.deadline)}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[11px] text-muted-foreground font-bold">Aşama:</span>
                            <select
                              value={card.status}
                              onChange={(e) => updateEditStatus(card.id, e.target.value)}
                              className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-extrabold outline-none cursor-pointer"
                            >
                              <option value="client_review">👀 Müşteri Onayında</option>
                              <option value="editing">🎬 Kurguya Geri Al</option>
                              <option value="ready">🚀 Onaylandı ➔ (Paylaşıma Hazır'a Gönder)</option>
                            </select>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Biten Editler (Paylaşıma Hazır) — 3'lü Carousel Slider */}
        {mainCategory === 'completed' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-white">Müşteri Onayından Geçen & Paylaşıma Hazır İçerikler</h4>
                  <p className="text-xs text-emerald-200/80">Yayına ve paylaşıma girmeye hazır tüm editler</p>
                </div>
              </div>

              {getSlideCount(completedEdits.length) > 1 && (
                <div className="flex items-center gap-1.5 bg-emerald-950/60 p-1 rounded-xl border border-emerald-500/30">
                  <button
                    onClick={() => setCompletedSlide((p) => Math.max(0, p - 1))}
                    disabled={completedSlide === 0}
                    className="p-1 rounded-lg hover:bg-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold font-mono px-2 text-emerald-200">
                    {completedSlide + 1} / {getSlideCount(completedEdits.length)}
                  </span>
                  <button
                    onClick={() =>
                      setCompletedSlide((p) =>
                        Math.min(getSlideCount(completedEdits.length) - 1, p + 1)
                      )
                    }
                    disabled={completedSlide >= getSlideCount(completedEdits.length) - 1}
                    className="p-1 rounded-lg hover:bg-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {completedEdits.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground border-dashed rounded-xl">
                Henüz onaylanıp paylaşıma hazır hale getirilen bir edit bulunmuyor.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getSlideItems(completedEdits, completedSlide).map((card) => (
                  <Card key={card.id} className="p-4 bg-card border border-emerald-500/40 bg-emerald-500/5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {card.client}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-extrabold">
                            🚀 Paylaşıma Hazır
                          </Badge>
                          <button
                            onClick={() => deleteEdit(card.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-extrabold text-base text-foreground mt-1 mb-2 line-clamp-2">{card.title}</h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center text-foreground font-semibold">
                          <User className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Editör: {card.editor}
                        </div>
                        <div className="flex items-center font-mono">
                          <Calendar className="w-3.5 h-3.5 mr-1" /> {formatDateTr(card.deadline)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[10px] text-muted-foreground font-semibold">Revize İsteği Varsa:</span>
                        <select
                          value={card.status}
                          onChange={(e) => updateEditStatus(card.id, e.target.value)}
                          className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-medium outline-none cursor-pointer"
                        >
                          <option value="ready">🚀 Paylaşıma Hazır</option>
                          <option value="client_review">👀 Tekrar Onaya Gönder</option>
                          <option value="editing">🎬 Tekrar Kurguya Al</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
