'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Film, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function YeniEditPage() {
  const router = useRouter();
  const { isletmeler, ekip, addEdit } = useData();

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [customClient, setCustomClient] = useState('');
  const [type, setType] = useState('Reels');
  const [editor, setEditor] = useState('');
  const [deadline, setDeadline] = useState(todayStr);
  const [status, setStatus] = useState('editing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalClient = selectedClient === '__other__' ? customClient.trim() : selectedClient.trim();
    if (!finalClient || !title.trim()) return;

    addEdit({
      title: title.trim(),
      client: finalClient,
      type,
      editor: editor || 'Atanmadı',
      deadline: deadline || todayStr,
      status,
    });

    router.push('/editler');
  };

  return (
    <div>
      <Header title="Yeni Edit Ekle" />
      <div className="px-4 lg:px-8 pb-8">
        <div className="mb-4">
          <Link href="/editler">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Editlere Dön
            </Button>
          </Link>
        </div>

        <PageHeader
          title="Yeni Edit Görevi Aç"
          subtitle="Kurgucu ekibinize yeni video editi veya revize görevi atayın."
          icon={Film}
        />

        <div className="mt-6 max-w-xl">
          <Card className="p-6 bg-card border-border shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-sm">Edit / Video Başlığı *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: 1. Reels - Sinematik Tanıtım Editi"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client" className="font-bold text-sm">Müşteri İşletme *</Label>
                <select
                  id="client"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                  required
                >
                  <option value="">İşletme Seçiniz...</option>
                  {isletmeler.map((biz) => (
                    <option key={biz.id} value={biz.name}>
                      {biz.name}
                    </option>
                  ))}
                  <option value="__other__">➕ Manuel İşletme Yaz...</option>
                </select>
              </div>

              {selectedClient === '__other__' && (
                <div className="space-y-2">
                  <Label htmlFor="customClient" className="font-semibold text-xs">İşletme Adı Girin *</Label>
                  <Input
                    id="customClient"
                    value={customClient}
                    onChange={(e) => setCustomClient(e.target.value)}
                    placeholder="Örn: Yeni Müşteri Ltd."
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="font-semibold text-xs">İçerik Türü</Label>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    <option value="Reels">📱 Instagram Reels</option>
                    <option value="Post">🖼️ Post / Görsel</option>
                    <option value="Story">⚡ Story / Hikaye</option>
                    <option value="YouTube">🔴 YouTube Video</option>
                    <option value="Reklam">📢 Reklam / Ads</option>
                    <option value="Kurumsal">🏢 Kurumsal Video</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editor" className="font-semibold text-xs">Sorumlu Editör</Label>
                  <select
                    id="editor"
                    value={editor}
                    onChange={(e) => setEditor(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    <option value="">Editör Seçiniz...</option>
                    {ekip.map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="font-semibold text-xs">Son Teslim Tarihi *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="font-semibold text-xs">Kurgu Durumu</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                  >
                    <option value="editing">🎬 Kurguda</option>
                    <option value="waiting">⏳ Kurgu Bekliyor</option>
                    <option value="client_review">👀 Müşteri Onayında</option>
                    <option value="ready">🚀 Bitenler (Paylaşıma Hazır)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Link href="/editler">
                  <Button variant="outline" type="button">Vazgeç</Button>
                </Link>
                <Button type="submit" className="bg-primary hover:bg-primary/90 font-bold px-6">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Editi Kaydet
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
