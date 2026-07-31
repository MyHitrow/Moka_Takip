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
import { Film, Calendar, User, Trash2, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
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
  const [status, setStatus] = useState('waiting');

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
    setStatus('waiting');
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

  const columnsPending = [
    { key: 'waiting', title: 'Kurgu Bekliyor', cards: editler.filter((e) => e.status === 'waiting') },
    { key: 'editing', title: 'Kurguda / Yapılıyor', cards: editler.filter((e) => e.status === 'editing') },
    { key: 'client_review', title: 'Müşteri Onayında', cards: editler.filter((e) => e.status === 'client_review') },
  ];

  const columnsCompleted = [
    { key: 'ready', title: 'Tamamlandı / Yayına Hazır', cards: completedEdits },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div>
      <Header title="Editler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Editler & Kurgu Yönetimi"
          subtitle="Yapılması gereken ve tamamlanan edit görevleri"
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
                    <Label htmlFor="status">Durum</Label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="waiting">Kurgu Bekliyor</option>
                      <option value="editing">Kurguda (Yapılıyor)</option>
                      <option value="client_review">Müşteri Onayında</option>
                      <option value="ready">Tamamlandı / Yayına Hazır</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90">
                    Kaydet ve Görevlendir
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />

        {/* Category Split Tabs: Yapılması Gerekenler vs Bitenler */}
        <div className="mt-6 flex items-center gap-2 bg-card border border-border p-1.5 rounded-xl max-w-md">
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
            <CheckCircle2 className="w-4 h-4" /> Biten Editler ({completedEdits.length})
          </button>
        </div>

        {/* View Mode 1: Yapılması Gereken Editler */}
        {mainCategory === 'pending' && (
          <div className="mt-6 overflow-x-auto pb-6">
            <div className="flex gap-4 min-w-full md:min-w-max">
              {columnsPending.map((col) => (
                <div
                  key={col.key}
                  className="w-full md:w-80 min-w-[280px] bg-card/60 rounded-xl p-3 flex flex-col min-h-[420px] border border-border shadow-xs"
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-sm font-bold text-foreground">{col.title}</h3>
                    <Badge variant="secondary" className="text-xs font-mono font-bold">{col.cards.length}</Badge>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                    {col.cards.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                        Bu aşamada edit bulunmuyor.
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
                                ? 'border-primary/60 red-border-left bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold text-primary">{card.client}</span>
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{card.type}</Badge>
                                <button
                                  onClick={() => deleteEdit(card.id)}
                                  className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                                  title="Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <h4 className="font-extrabold text-sm mb-3 text-foreground">{card.title}</h4>

                            {(isDueToday || isOverdue) && (
                              <div className="mb-2 p-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold rounded-lg flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>{isDueToday ? 'Bugün Yapılması Gerekiyor!' : 'Teslim Tarihi Gecikti!'}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <div className="flex items-center font-semibold text-foreground">
                                <User className="w-3.5 h-3.5 mr-1 text-primary" /> {card.editor}
                              </div>
                              <div className="flex items-center font-mono">
                                <Calendar className="w-3.5 h-3.5 mr-1 text-muted-foreground" /> {formatDateTr(card.deadline)}
                              </div>
                            </div>
                            <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                              <span className="text-[10px] text-muted-foreground font-semibold">Durumu:</span>
                              <select
                                value={card.status}
                                onChange={(e) => updateEditStatus(card.id, e.target.value)}
                                className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-bold outline-none cursor-pointer"
                              >
                                <option value="waiting">Kurgu Bekliyor</option>
                                <option value="editing">Kurguda (Yapılıyor)</option>
                                <option value="client_review">Müşteri Onayında</option>
                                <option value="ready">Bitti (Tamamlandı)</option>
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

        {/* View Mode 2: Biten Editler */}
        {mainCategory === 'completed' && (
          <div className="mt-6 space-y-3">
            {completedEdits.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground border-dashed">
                Henüz tamamlanmış bir edit bulunmuyor.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {completedEdits.map((card) => (
                  <Card key={card.id} className="p-4 bg-card border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-emerald-400">{card.client}</span>
                        <h4 className="font-extrabold text-base text-foreground mt-0.5">{card.title}</h4>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                        Tamamlandı
                      </Badge>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center text-foreground font-semibold">
                        <User className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Yapan: {card.editor}
                      </div>
                      <div className="flex items-center font-mono">
                        <Calendar className="w-3.5 h-3.5 mr-1" /> {formatDateTr(card.deadline)}
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
