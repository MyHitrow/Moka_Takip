'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, AtSign, CheckCircle2, Trash2, Plus, Edit } from 'lucide-react';
import { useData, Isletme } from '@/context/data-context';

export default function IsletmelerPage() {
  const { isletmeler, addIsletme, updateIsletme, deleteIsletme } = useData();

  // Create Business Modal State
  const [openCreate, setOpenCreate] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [fee, setFee] = useState('');

  // Edit Business Modal State
  const [openEdit, setOpenEdit] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Isletme | null>(null);
  const [editName, setEditName] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editFee, setEditFee] = useState('');
  const [editActive, setEditActive] = useState(true);

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
    });
    setName('');
    setContact('');
    setPhone('');
    setInstagram('');
    setFee('');
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
    });

    setOpenEdit(false);
    setEditingBusiness(null);
  };

  return (
    <div>
      <Header title="İşletmeler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="İşletmeler"
          subtitle="Müşteri işletmelerin yönetimi ve bilgi güncellemesi"
          icon={Building2}
          action={
            <Dialog open={openCreate} onOpenChange={setOpenCreate}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90 font-bold">
                    <Plus className="w-4 h-4 mr-2" /> Yeni İşletme Ekle
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni İşletme Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">İşletme Adı</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Lezzet Restoran"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Yetkili Kişi</Label>
                    <Input
                      id="contact"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Örn: Ahmet Yılmaz"
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
                    <Label htmlFor="fee">Aylık Anlaşma Ücreti (TL)</Label>
                    <Input
                      id="fee"
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="8000"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold">
                    Kaydet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isletmeler.map((business) => (
              <Card key={business.id} className="bg-card border border-border rounded-xl p-5 relative group hover:border-primary/50 transition-colors shadow-xs">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-extrabold text-lg text-foreground">{business.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {business.active ? (
                      <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
                        Pasif
                      </span>
                    )}

                    <button
                      onClick={() => handleStartEdit(business)}
                      className="text-muted-foreground hover:text-primary transition-colors p-1"
                      title="İşletme Bilgilerini Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteIsletme(business.id)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <span className="w-24 font-semibold">Yetkili:</span> <span className="text-foreground font-medium">{business.contact}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-primary" /> <span className="text-foreground font-mono font-medium">{business.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <AtSign className="w-4 h-4 mr-2 text-primary" /> <span className="text-foreground font-mono font-medium">{business.instagram}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                    <span className="font-semibold text-xs text-muted-foreground">Aylık Paket Ücreti:</span>
                    <span className="font-extrabold text-base text-foreground font-mono">{business.fee}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT BUSINESS MODAL */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>İşletme Bilgilerini Güncelle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="editNameInput">İşletme Adı</Label>
              <Input
                id="editNameInput"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editContactInput">Yetkili Kişi</Label>
              <Input
                id="editContactInput"
                value={editContact}
                onChange={(e) => setEditContact(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPhoneInput">Telefon</Label>
              <Input
                id="editPhoneInput"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editInstagramInput">Instagram</Label>
              <Input
                id="editInstagramInput"
                value={editInstagram}
                onChange={(e) => setEditInstagram(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editFeeInput">Aylık Anlaşma Ücreti (TL)</Label>
              <Input
                id="editFeeInput"
                type="number"
                value={editFee}
                onChange={(e) => setEditFee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editActiveSelect">Anlaşma Durumu</Label>
              <select
                id="editActiveSelect"
                value={editActive ? 'true' : 'false'}
                onChange={(e) => setEditActive(e.target.value === 'true')}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-bold text-foreground"
              >
                <option value="true">✅ Aktif Müşteri</option>
                <option value="false">⏸️ Pasif (Anlaşma Bitti)</option>
              </select>
            </div>
            <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 font-bold">
              Güncellemeleri Kaydet
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
