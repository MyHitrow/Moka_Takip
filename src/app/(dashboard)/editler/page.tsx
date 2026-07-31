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
import { Film, Calendar, User, Trash2, Plus, CheckCircle2, Clock, AlertTriangle, Video, Eye, Send } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function EditlerPage() {
  const { editler, ekip, systemUsers, addEdit, deleteEdit, updateEditStatus, formatDateTr } = useData();
  const [open, setOpen] = useState(false);
  const [mainCategory, setMainCategory] = useState<'pending' | 'completed'>('pending');

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('Reels');
  const [editor, setEditor] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('editing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !client) return;
    addEdit({
      title,
      client,
      type,
      editor: editor || 'Atanmadı',
      deadline: deadline || 'Belirtilmedi',
      status,
    });
    setTitle('');
    setClient('');
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

  const pendingEdits = editler.filter((e) => e.status !== 'ready' && e.status !== 'published');
  const completedEdits = editler.filter((e) => e.status === 'ready' || e.status === 'published');

  // "Yapılması Gereken Editler" split into exactly 2 columns: 1. Kurguda, 2. Onayda
  const columnsPending = [
    {
      key: 'editing',
      title: '🎬 1. Kurguda / Yapılıyor',
      cards: editler.filter((e) => e.status === 'editing' || e.status === 'waiting'),
    },
    {
      key: 'client_review',
      title: '👀 2. Müşteri Onayında',
      cards: editler.filter((e) => e.status === 'client_review'),
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

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
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Edit Görevi Ekle & Editör Atama</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Müşteri / İşletme</Label>
                    <Input
                      id="client"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Örn: Acme Cafe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">İçerik Başlığı</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: Tanıtım Reels #1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editorSelect">Görevi Yapacak Editör / Ekip Üyesi</Label>
                    <select
                      id="editorSelect"
                      value={editor}
                      onChange={(e) => setEditor(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground font-medium"
                    >
                      <option value="">Editör Seçin (Atanmadı)</option>
                      {availableEditors.map((ed) => (
                        <option key={ed} value={ed}>
                          {ed}
                        </option>
                      ))}
                      <option value="Dış Editör">Dış Freelance Editör</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">İçerik Tipi</Label>
                      <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="Reels">Reels</option>
                        <option value="Post">Post</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Story">Story</option>
                        <option value="Video">Video</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Son Teslim Tarihi</Label>
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
                    <Label htmlFor="status">Başlangıç Aşaması</Label>
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

                  <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold">
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

        {/* View Mode 1: Yapılması Gereken Editler (Kurguda vs Onayda) */}
        {mainCategory === 'pending' && (
          <div className="mt-6 overflow-x-auto pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-full">
              {columnsPending.map((col) => (
                <div
                  key={col.key}
                  className="bg-card/70 rounded-2xl p-4 flex flex-col min-h-[460px] border border-border shadow-xs"
                >
                  <div className="flex items-center justify-between mb-4 px-1 pb-3 border-b border-border">
                    <h3 className="text-base font-extrabold text-foreground">{col.title}</h3>
                    <Badge variant="secondary" className="text-xs font-mono font-extrabold px-2.5 py-0.5">{col.cards.length} İş</Badge>
                  </div>
                  <div className="flex-1 space-y-3.5 overflow-y-auto pr-0.5">
                    {col.cards.length === 0 ? (
                      <div className="p-10 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border flex flex-col items-center justify-center gap-2">
                        {col.key === 'editing' ? <Video className="w-8 h-8 opacity-40" /> : <Eye className="w-8 h-8 opacity-40" />}
                        <span>Bu aşamada edit bulunmuyor.</span>
                      </div>
                    ) : (
                      col.cards.map((card) => {
                        const isDueToday = card.deadline === todayStr;
                        const isOverdue = card.deadline < todayStr;

                        return (
                          <Card
                            key={card.id}
                            className={`p-4 bg-card border transition-colors shadow-xs ${
                              isDueToday || isOverdue
                                ? 'border-primary/70 red-border-left bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-extrabold text-primary">{card.client}</span>
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
                            <h4 className="font-extrabold text-base mb-3 text-foreground">{card.title}</h4>

                            {(isDueToday || isOverdue) && (
                              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{isDueToday ? 'Bugün Yapılması Gerekiyor!' : 'Teslim Tarihi Gecikti!'}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <div className="flex items-center font-bold text-foreground">
                                <User className="w-3.5 h-3.5 mr-1 text-primary" /> {card.editor}
                              </div>
                              <div className="flex items-center font-mono font-semibold">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {formatDateTr(card.deadline)}
                              </div>
                            </div>
                            <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
                              <span className="text-[11px] text-muted-foreground font-bold">Aşama Değiştir:</span>
                              <select
                                value={card.status}
                                onChange={(e) => updateEditStatus(card.id, e.target.value)}
                                className="text-xs bg-background border border-input rounded-md px-2 py-1.5 text-foreground font-extrabold outline-none cursor-pointer"
                              >
                                <option value="editing">🎬 Kurguda (Yapılıyor)</option>
                                <option value="client_review">👀 Müşteri Onayında</option>
                                <option value="ready">🚀 Onaylandı ➔ (Paylaşıma Hazır'a Gönder)</option>
                              </select>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 2: Biten Editler (Paylaşıma Hazır) */}
        {mainCategory === 'completed' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-white">Müşteri Onayından Geçen & Paylaşıma Hazır İçerikler</h4>
                <p className="text-xs text-emerald-200/80">Buradaki editler yayına girmeye hazır durumdadır.</p>
              </div>
            </div>

            {completedEdits.length === 0 ? (
              <Card className="p-12 text-center text-muted-foreground border-dashed rounded-xl">
                Henüz onaylanıp paylaşıma hazır hale getirilen bir edit bulunmuyor.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedEdits.map((card) => (
                  <Card key={card.id} className="p-4 bg-card border border-emerald-500/40 bg-emerald-500/5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-emerald-400">{card.client}</span>
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
                      <h4 className="font-extrabold text-base text-foreground mt-1 mb-2">{card.title}</h4>
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
