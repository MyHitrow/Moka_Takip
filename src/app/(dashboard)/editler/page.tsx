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
import { Film, Calendar, User, Trash2, Plus, SlidersHorizontal } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function EditlerPage() {
  const { editler, addEdit, deleteEdit, updateEditStatus, formatDateTr } = useData();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

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

  const columns = [
    { key: 'waiting', title: 'Kurgu Bekliyor', cards: editler.filter((e) => e.status === 'waiting') },
    { key: 'editing', title: 'Kurguda', cards: editler.filter((e) => e.status === 'editing') },
    { key: 'client_review', title: 'Müşteri Onayında', cards: editler.filter((e) => e.status === 'client_review') },
    { key: 'ready', title: 'Yayına Hazır', cards: editler.filter((e) => e.status === 'ready') },
  ];

  const visibleColumns = activeTab === 'all' ? columns : columns.filter((c) => c.key === activeTab);

  return (
    <div>
      <Header title="Editler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Editler"
          subtitle="İçerik kurgu ve düzenleme yönetimi"
          icon={Film}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Yeni Edit
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Edit Görevi Ekle</DialogTitle>
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
                      <Label htmlFor="editor">Editör</Label>
                      <Input
                        id="editor"
                        value={editor}
                        onChange={(e) => setEditor(e.target.value)}
                        placeholder="Editör Adı"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Teslim Tarihi</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
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
                        <option value="waiting">Kurgu Bekliyor</option>
                        <option value="editing">Kurguda</option>
                        <option value="client_review">Müşteri Onayında</option>
                        <option value="ready">Yayına Hazır</option>
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

        {/* Mobile Segment Filter Buttons */}
        <div className="mt-4 md:hidden overflow-x-auto flex items-center gap-1.5 pb-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="text-xs shrink-0"
          >
            <SlidersHorizontal className="w-3 h-3 mr-1" /> Tüm Kolonlar
          </Button>
          <Button
            variant={activeTab === 'waiting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('waiting')}
            className="text-xs shrink-0"
          >
            Bekliyor
          </Button>
          <Button
            variant={activeTab === 'editing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('editing')}
            className="text-xs shrink-0"
          >
            Kurguda
          </Button>
          <Button
            variant={activeTab === 'client_review' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('client_review')}
            className="text-xs shrink-0"
          >
            Onayda
          </Button>
          <Button
            variant={activeTab === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('ready')}
            className="text-xs shrink-0"
          >
            Hazır
          </Button>
        </div>

        {/* Board View with Responsive Columns */}
        <div className="mt-4 overflow-x-auto pb-6">
          <div className="flex gap-4 min-w-full md:min-w-max">
            {visibleColumns.map((col) => (
              <div
                key={col.key}
                className="w-full md:w-80 min-w-[280px] bg-card/60 rounded-xl p-3 flex flex-col min-h-[400px] border border-border shadow-xs"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-sm font-bold text-foreground">{col.title}</h3>
                  <Badge variant="secondary" className="text-xs font-mono">{col.cards.length}</Badge>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto pr-0.5">
                  {col.cards.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                      Bu aşamada edit bulunmuyor.
                    </div>
                  ) : (
                    col.cards.map((card) => (
                      <Card key={card.id} className="p-3.5 bg-card border border-border hover:border-primary/50 transition-colors shadow-xs">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-primary">{card.client}</span>
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
                        <h4 className="font-bold text-sm mb-3 text-foreground">{card.title}</h4>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center"><User className="w-3 h-3 mr-1 text-muted-foreground" /> {card.editor}</div>
                          <div className="flex items-center"><Calendar className="w-3 h-3 mr-1 text-muted-foreground" /> {formatDateTr(card.deadline)}</div>
                        </div>
                        <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                          <span className="text-[10px] text-muted-foreground font-medium">Aşamayı Değiştir:</span>
                          <select
                            value={card.status}
                            onChange={(e) => updateEditStatus(card.id, e.target.value)}
                            className="text-xs bg-background border border-input rounded-md px-2 py-1 text-foreground font-medium outline-none cursor-pointer"
                          >
                            <option value="waiting">Kurgu Bekliyor</option>
                            <option value="editing">Kurguda</option>
                            <option value="client_review">Müşteri Onayında</option>
                            <option value="ready">Yayına Hazır</option>
                          </select>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
