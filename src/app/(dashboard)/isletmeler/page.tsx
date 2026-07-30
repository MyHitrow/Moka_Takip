'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Phone, AtSign, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function IsletmelerPage() {
  const { isletmeler, addIsletme, deleteIsletme } = useData();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [fee, setFee] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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
    setOpen(false);
  };

  return (
    <div>
      <Header title="İşletmeler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="İşletmeler"
          subtitle="Müşteri işletmelerin yönetimi"
          icon={Building2}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Yeni İşletme
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni İşletme Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                  <Button type="submit" className="w-full mt-4">
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
              <Card key={business.id} className="bg-card border border-border rounded-xl p-5 relative group">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{business.name}</h3>
                  <div className="flex items-center gap-2">
                    {business.active ? (
                      <span className="flex items-center text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Aktif
                      </span>
                    ) : (
                      <span className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        Pasif
                      </span>
                    )}
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
                    <span className="w-24">Yetkili:</span> <span className="text-foreground">{business.contact}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" /> <span className="text-foreground">{business.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <AtSign className="w-4 h-4 mr-2" /> <span className="text-foreground">{business.instagram}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-border flex justify-between items-center">
                    <span>Aylık Ücret:</span>
                    <span className="font-semibold text-foreground">{business.fee}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
