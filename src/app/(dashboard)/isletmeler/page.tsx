'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Phone, AtSign, CheckCircle2, Trash2, Plus, Edit, Bot, Sparkles } from 'lucide-react';
import { useData, Isletme } from '@/context/data-context';

import { PermissionGuard } from '@/components/shared/permission-guard';

export default function IsletmelerPage() {
  return (
    <PermissionGuard requiredPermission="canManageClients">
      <IsletmelerPageContent />
    </PermissionGuard>
  );
}

function IsletmelerPageContent() {
  const { isletmeler, addIsletme, updateIsletme, deleteIsletme } = useData();

  // Create Business Modal State
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [fee, setFee] = useState('');
  const [maxDaysBetweenPosts, setMaxDaysBetweenPosts] = useState<number>(3);
  const [monthlyReelsTarget, setMonthlyReelsTarget] = useState<number>(10);
  const [monthlyShootTarget, setMonthlyShootTarget] = useState<number>(2);
  const [notes, setNotes] = useState('');

  // Edit Business Modal State
  const [openEdit, setOpenEdit] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Isletme | null>(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editFee, setEditFee] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editMaxDaysBetweenPosts, setEditMaxDaysBetweenPosts] = useState<number>(3);
  const [editMonthlyReelsTarget, setEditMonthlyReelsTarget] = useState<number>(10);
  const [editMonthlyShootTarget, setEditMonthlyShootTarget] = useState<number>(2);
  const [editNotes, setEditNotes] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addIsletme({
      name,
      contact: contact || '-',
      phone: phone || '-',
      instagram: instagram.startsWith('@') ? instagram : `@${instagram}`,
      fee: fee ? `${fee} ₺` : '0 ₺',
      active: true,
      maxDaysBetweenPosts: Number(maxDaysBetweenPosts) || 3,
      monthlyReelsTarget: Number(monthlyReelsTarget) || 10,
      monthlyShootTarget: Number(monthlyShootTarget) || 2,
      notes,
    });
    setName('');
    setContact('');
    setPhone('');
    setInstagram('');
    setFee('');
    setMaxDaysBetweenPosts(3);
    setMonthlyReelsTarget(10);
    setMonthlyShootTarget(2);
    setNotes('');
    setOpenCreate(false);
  };

  const handleStartEdit = (biz: Isletme) => {
    setEditingBusiness(biz);
    setEditName(biz.name);
    setEditContact(biz.contact);
    setEditPhone(biz.phone);
    setEditInstagram(biz.instagram);
    setEditFee(biz.fee.replace(/[^0-9.]/g, ''));
    setEditActive(biz.active);
    setEditMaxDaysBetweenPosts(biz.maxDaysBetweenPosts || 3);
    setEditMonthlyReelsTarget(biz.monthlyReelsTarget || 10);
    setEditMonthlyShootTarget(biz.monthlyShootTarget || 2);
    setEditNotes(biz.notes || '');
    setOpenEdit(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness || !editName) return;

    updateIsletme(editingBusiness.id, {
      name: editName,
      contact: editContact || '-',
      phone: editPhone || '-',
      instagram: editInstagram.startsWith('@') ? editInstagram : `@${editInstagram}`,
      fee: editFee ? `${editFee} ₺` : '0 ₺',
      active: editActive,
      maxDaysBetweenPosts: Number(editMaxDaysBetweenPosts) || 3,
      monthlyReelsTarget: Number(editMonthlyReelsTarget) || 10,
      monthlyShootTarget: Number(editMonthlyShootTarget) || 2,
      notes: editNotes,
    });

    setOpenEdit(false);
    setEditingBusiness(null);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Header title="İşletmeler" />
      <PageHeader
        title="İşletmeler & AI Paket Eğitimi"
        subtitle="Müşteri işletmelerin paket kotaları ve Yapay Zeka Bekçi kuralları"
        icon={Building2}
        action={
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger
              render={
                <Button className="bg-primary hover:bg-primary/90 font-bold w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Yeni İşletme Ekle
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[480px] bg-card border-border max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Yeni İşletme Ekle & AI Eğit</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="name">İşletme Adı</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Örn: Atoma"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Yetkili Kişi</Label>
                    <Input
                      id="contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@kullaniciadi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fee">Aylık Ücret (TL)</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="15000"
                    />
                  </div>
                </div>

                {/* 🤖 AI BEKÇİ EĞİTİM KUTUSU */}
                <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                    <span className="font-bold text-xs text-primary">🤖 AI Bekçi Eğitme Ayarları</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px]">Kaç günde 1 paylaşım?</Label>
                      <Input
                        type="number"
                        value={maxDaysBetweenPosts}
                        onChange={(e) => setMaxDaysBetweenPosts(Number(e.target.value))}
                        className="h-8 text-xs mt-1"
                        min={1}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Aylık Reels Hedefi</Label>
                      <Input
                        type="number"
                        value={monthlyReelsTarget}
                        onChange={(e) => setMonthlyReelsTarget(Number(e.target.value))}
                        className="h-8 text-xs mt-1"
                        min={1}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Aylık Çekim Hedefi</Label>
                      <Input
                        type="number"
                        value={monthlyShootTarget}
                        onChange={(e) => setMonthlyShootTarget(Number(e.target.value))}
                        className="h-8 text-xs mt-1"
                        min={1}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 mt-3">
                    <Label htmlFor="notesInput" className="text-xs font-bold text-[#F7F7F8]">🧠 AI Hafıza & Kritik Notlar</Label>
                    <textarea
                      id="notesInput"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Örn: Taviz vermeyen müşteri, Çekim günlerimiz Salı/Cuma, zor Reels videoları, Ads reklamı gerekli..."
                      className="w-full h-20 rounded-lg border border-[#2B2D32] bg-[#0D0E10] p-2.5 text-xs text-[#F7F7F8] placeholder:text-[#73767E] outline-none focus:border-[#E32636]"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold">
                  İşletmeyi Kaydet & AI Eğit
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isletmeler.map((business) => (
          <Card key={business.id} className="bg-card border border-border rounded-2xl p-5 relative group hover:border-primary/50 transition-colors shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-extrabold text-lg text-foreground">{business.name}</h3>
                <div className="flex items-center gap-1.5">
                  {business.active ? (
                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                      Pasif
                    </span>
                  )}

                  <button
                    onClick={() => handleStartEdit(business)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    title="İşletmeyi Düzenle & AI Ayarla"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteIsletme(business.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                    title="İşletmeyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 🤖 AI BEKÇİ EĞİTİM BADGE'İ */}
              <div className="p-2.5 bg-card/60 border border-primary/30 rounded-xl space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-primary text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Takip Kuralı:
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground font-medium pt-0.5">
                  <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-foreground font-bold">
                    {business.maxDaysBetweenPosts || 3} Günde 1 Paylaşım
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-foreground font-bold">
                    {business.monthlyReelsTarget || 10} Reels/Ay
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 border-primary/30 text-foreground font-bold">
                    {business.monthlyShootTarget || 2} Çekim/Ay
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground">
                {business.contact && (
                  <p className="flex items-center">
                    <span className="font-semibold text-foreground mr-1">Yetkili:</span> {business.contact}
                  </p>
                )}
                {business.phone && (
                  <p className="flex items-center">
                    <Phone className="w-3 h-3 mr-1 text-primary" /> {business.phone}
                  </p>
                )}
                {business.instagram && (
                  <p className="flex items-center">
                    <AtSign className="w-3 h-3 mr-1 text-primary" /> {business.instagram}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium">Aylık Paket Ücreti:</span>
              <span className="font-extrabold text-sm text-foreground">{business.fee}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* EDIT MODAL */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İşletme Bilgilerini & AI Ayarlarını Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="editName">İşletme Adı</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editContact">Yetkili Kişi</Label>
                <Input
                  id="editContact"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Telefon</Label>
                <Input
                  id="editPhone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="editInstagram">Instagram</Label>
                <Input
                  id="editInstagram"
                  value={editInstagram}
                  onChange={(e) => setEditInstagram(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editFee">Aylık Ücret (TL)</Label>
                <Input
                  id="editFee"
                  type="number"
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                />
              </div>
            </div>

            {/* 🤖 EDIT AI BEKÇİ EĞİTİM KUTUSU */}
            <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-bold text-xs text-primary">🤖 AI Bekçi Eğitme Ayarları</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px]">Kaç günde 1 paylaşım?</Label>
                  <Input
                    type="number"
                    value={editMaxDaysBetweenPosts}
                    onChange={(e) => setEditMaxDaysBetweenPosts(Number(e.target.value))}
                    className="h-8 text-xs mt-1"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Aylık Reels Hedefi</Label>
                  <Input
                    type="number"
                    value={editMonthlyReelsTarget}
                    onChange={(e) => setEditMonthlyReelsTarget(Number(e.target.value))}
                    className="h-8 text-xs mt-1"
                    min={1}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Aylık Çekim Hedefi</Label>
                  <Input
                    type="number"
                    value={editMonthlyShootTarget}
                    onChange={(e) => setEditMonthlyShootTarget(Number(e.target.value))}
                    className="h-8 text-xs mt-1"
                    min={1}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editActive">Sözleşme Durumu</Label>
              <select
                id="editActive"
                value={editActive ? 'active' : 'inactive'}
                onChange={(e) => setEditActive(e.target.value === 'active')}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-bold"
              >
                <option value="active">🟢 Aktif Sözleşme</option>
                <option value="inactive">🔴 Pasif / İptal</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="editNotesInput" className="text-xs font-bold text-[#F7F7F8]">🧠 AI Hafıza & Kritik Notlar</Label>
              <textarea
                id="editNotesInput"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Örn: Taviz vermeyen müşteri, Çekim günlerimiz Salı/Cuma, zor Reels videoları, Ads reklamı gerekli..."
                className="w-full h-20 rounded-lg border border-[#2B2D32] bg-[#0D0E10] p-2.5 text-xs text-[#F7F7F8] placeholder:text-[#73767E] outline-none focus:border-[#E32636]"
              />
            </div>

            <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold">
              Değişiklikleri Kaydet & AI Eğit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
