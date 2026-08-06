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
  Building2,
} from 'lucide-react';
import { useData } from '@/context/data-context';

import { PermissionGuard } from '@/components/shared/permission-guard';

export default function EditlerPage() {
  return (
    <PermissionGuard requiredPermission="canManageEdits">
      <EditlerPageContent />
    </PermissionGuard>
  );
}

function EditlerPageContent() {
  const { editler, ekip, isletmeler, addEdit, deleteEdit, updateEditStatus, formatDateTr } = useData();
  const [open, setOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState<'pending' | 'completed'>('pending');

  const [title, setTitle] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [type, setType] = useState('Reels');
  const [editor, setEditor] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('editing');

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

  const availableEditors = Array.from(
    new Set(ekip.map((m) => m.name))
  );

  const activeIsletmeler = isletmeler.filter((i) => i.active !== false);
  const passiveIsletmeler = isletmeler.filter((i) => i.active === false);

  const todayStr = new Date().toISOString().split('T')[0];

  const sortEditsByUrgency = (items: typeof editler) => {
    return [...items].sort((a, b) => {
      const isOverdueA = a.deadline && a.deadline < todayStr && a.deadline !== 'Belirtilmedi';
      const isOverdueB = b.deadline && b.deadline < todayStr && b.deadline !== 'Belirtilmedi';

      const isTodayA = a.deadline === todayStr;
      const isTodayB = b.deadline === todayStr;

      // 1. Overdue items FIRST
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;

      // 2. Today's items SECOND
      if (isTodayA && !isTodayB) return -1;
      if (!isTodayA && isTodayB) return 1;

      // 3. Compare deadline dates ascending
      const dA = (!a.deadline || a.deadline === 'Belirtilmedi') ? '9999-99-99' : a.deadline;
      const dB = (!b.deadline || b.deadline === 'Belirtilmedi') ? '9999-99-99' : b.deadline;
      return dA.localeCompare(dB);
    });
  };

  const pendingEdits = sortEditsByUrgency(editler.filter((e) => e.status !== 'ready' && e.status !== 'published'));
  const completedEdits = sortEditsByUrgency(editler.filter((e) => e.status === 'ready' || e.status === 'published'));

  const editingEdits = sortEditsByUrgency(editler.filter((e) => e.status !== 'client_review' && e.status !== 'ready' && e.status !== 'published'));
  const reviewEdits = sortEditsByUrgency(editler.filter((e) => e.status === 'client_review'));

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

        {/* Category Split Tabs */}
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

        {/* VIEW 1: Yapılması Gereken Editler (🎬 1. Kurguda & 👀 2. Müşteri Onayında) — Tek satırda 5 video kutusu */}
        {mainCategory === 'pending' && (
          <div className="mt-6 space-y-6">
            {/* Section 1: 🎬 1. Kurguda & Revizedekiler */}
            <div className="bg-card/70 rounded-2xl p-4 border border-border shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">1. Kurguda & Revizedekiler</h3>
                </div>
                <Badge variant="secondary" className="text-xs font-mono font-extrabold px-2.5 py-0.5">
                  {editingEdits.length} Video
                </Badge>
              </div>

              {/* 5-Column Grid (Wraps automatically on 6th item) */}
              {editingEdits.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border flex items-center justify-center gap-2">
                  <Video className="w-5 h-5 opacity-40" />
                  <span>Kurguda veya revizede olan edit bulunmuyor.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {editingEdits.map((card) => {
                    const isDueToday = card.deadline === todayStr;
                    const isOverdue = card.deadline < todayStr;
                    const isRevision = card.status === 'revision';

                    return (
                      <Card
                        key={card.id}
                        className={`p-3 bg-card border rounded-xl transition-all shadow-xs flex flex-col justify-between h-full ${
                          isRevision
                            ? 'border-red-500/80 bg-red-500/10'
                            : isDueToday || isOverdue
                            ? 'border-primary/70 red-border-left bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[11px] font-extrabold text-primary truncate max-w-[100px]" title={card.client}>
                              {card.client}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {isRevision ? (
                                <Badge className="bg-red-500 text-white text-[8px] px-1 py-0 font-extrabold">🔴 Revize</Badge>
                              ) : (
                                <Badge variant="outline" className="text-[8px] px-1 py-0 font-bold">{card.type}</Badge>
                              )}
                              <button
                                onClick={() => deleteEdit(card.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                                title="Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-extrabold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug" title={card.title}>
                            {card.title}
                          </h4>

                          {(isDueToday || isOverdue) && !isRevision && (
                            <div className="p-1 bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-bold rounded flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{isDueToday ? 'Bugün Teslim!' : 'Gecikti!'}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 pt-2 mt-2 border-t border-border/60">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex items-center font-bold text-foreground truncate max-w-[80px]">
                              <User className="w-2.5 h-2.5 mr-0.5 text-primary shrink-0" /> <span className="truncate">{card.editor}</span>
                            </div>
                            <div className="flex items-center font-mono font-semibold shrink-0">
                              <Calendar className="w-2.5 h-2.5 mr-0.5 text-muted-foreground" /> {formatDateTr(card.deadline)}
                            </div>
                          </div>

                          <select
                            value={card.status}
                            onChange={(e) => updateEditStatus(card.id, e.target.value)}
                            className="w-full text-[10px] h-6 bg-background border border-input rounded px-1 text-foreground font-extrabold outline-none cursor-pointer truncate"
                          >
                            <option value="editing">🎬 Kurguda</option>
                            <option value="revision">🔴 Revizede</option>
                            <option value="client_review">👀 Onayda</option>
                            <option value="ready">🚀 Bitenler</option>
                          </select>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: 👀 2. Müşteri Onayında */}
            <div className="bg-card/70 rounded-2xl p-4 border border-border shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg">
                    <Eye className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">2. Müşteri Onayında</h3>
                </div>
                <Badge variant="secondary" className="text-xs font-mono font-extrabold px-2.5 py-0.5">
                  {reviewEdits.length} Video
                </Badge>
              </div>

              {/* 5-Column Grid (Wraps automatically on 6th item) */}
              {reviewEdits.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border flex items-center justify-center gap-2">
                  <Eye className="w-5 h-5 opacity-40" />
                  <span>Müşteri onayında olan edit bulunmuyor.</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {reviewEdits.map((card) => {
                    const isDueToday = card.deadline === todayStr;
                    const isOverdue = card.deadline < todayStr;

                    return (
                      <Card
                        key={card.id}
                        className={`p-3 bg-card border rounded-xl transition-all shadow-xs flex flex-col justify-between h-full ${
                          isDueToday || isOverdue
                            ? 'border-amber-500/70 bg-amber-500/5'
                            : 'border-border hover:border-amber-500/40'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[11px] font-extrabold text-amber-500 truncate max-w-[100px]" title={card.client}>
                              {card.client}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <Badge variant="outline" className="text-[8px] px-1 py-0 font-bold">{card.type}</Badge>
                              <button
                                onClick={() => deleteEdit(card.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                                title="Sil"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-extrabold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug" title={card.title}>
                            {card.title}
                          </h4>
                        </div>

                        <div className="space-y-1.5 pt-2 mt-2 border-t border-border/60">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex items-center font-bold text-foreground truncate max-w-[80px]">
                              <User className="w-2.5 h-2.5 mr-0.5 text-amber-500 shrink-0" /> <span className="truncate">{card.editor}</span>
                            </div>
                            <div className="flex items-center font-mono font-semibold shrink-0">
                              <Calendar className="w-2.5 h-2.5 mr-0.5 text-muted-foreground" /> {formatDateTr(card.deadline)}
                            </div>
                          </div>

                          <select
                            value={card.status}
                            onChange={(e) => updateEditStatus(card.id, e.target.value)}
                            className="w-full text-[10px] h-6 bg-background border border-input rounded px-1 text-foreground font-extrabold outline-none cursor-pointer truncate"
                          >
                            <option value="client_review">👀 Onayda</option>
                            <option value="editing">🎬 Kurguda</option>
                            <option value="ready">🚀 Bitenler</option>
                          </select>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Biten Editler (Paylaşıma Hazır) — Tek satırda 5 video kutusu */}
        {mainCategory === 'completed' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-white">Müşteri Onayından Geçen & Paylaşıma Hazır İçerikler</h4>
                  <p className="text-xs text-emerald-200/80">Yayına ve paylaşıma girmeye hazır tüm editler ({completedEdits.length} Video)</p>
                </div>
              </div>
            </div>

            {completedEdits.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground border-dashed rounded-xl">
                Henüz onaylanıp paylaşıma hazır hale getirilen bir edit bulunmuyor.
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {completedEdits.map((card) => (
                  <Card key={card.id} className="p-3 bg-card border border-emerald-500/40 bg-emerald-500/5 shadow-xs flex flex-col justify-between h-full rounded-xl">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[11px] font-bold text-emerald-400 truncate max-w-[100px]" title={card.client}>
                          {card.client}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[8px] font-extrabold px-1 py-0">
                            🚀 Hazır
                          </Badge>
                          <button
                            onClick={() => deleteEdit(card.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                            title="Sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug" title={card.title}>
                        {card.title}
                      </h4>
                    </div>

                    <div className="space-y-1.5 pt-2 mt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex items-center font-semibold text-foreground truncate max-w-[80px]">
                          <User className="w-2.5 h-2.5 mr-0.5 text-emerald-400 shrink-0" /> <span className="truncate">{card.editor}</span>
                        </div>
                        <div className="flex items-center font-mono shrink-0">
                          <Calendar className="w-2.5 h-2.5 mr-0.5" /> {formatDateTr(card.deadline)}
                        </div>
                      </div>

                      <select
                        value={card.status}
                        onChange={(e) => updateEditStatus(card.id, e.target.value)}
                        className="w-full text-[10px] h-6 bg-background border border-input rounded px-1 text-foreground font-medium outline-none cursor-pointer truncate"
                      >
                        <option value="ready">🚀 Bitenler</option>
                        <option value="client_review">👀 Onayda</option>
                        <option value="editing">🎬 Kurguda</option>
                      </select>
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
