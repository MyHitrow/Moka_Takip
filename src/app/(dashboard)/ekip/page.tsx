'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Phone, Video, Trash2, Plus } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function EkipPage() {
  const { ekip, editler, addEkipUyesi, deleteEkipUyesi } = useData();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [role, setRole] = useState('Kurgucu');
  const [phone, setPhone] = useState('');
  const [color, setColor] = useState('bg-blue-500');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addEkipUyesi({
      name,
      role: role || 'Ekip Üyesi',
      phone: phone || '-',
      color,
    });
    setName('');
    setRole('Kurgucu');
    setPhone('');
    setColor('bg-blue-500');
    setOpen(false);
  };

  const getActiveEditsCount = (memberName: string) => {
    // Count edits assigned to this team member that are not yet ready/completed
    return editler.filter(
      (e) =>
        e.editor.toLowerCase().includes(memberName.toLowerCase()) ||
        memberName.toLowerCase().includes(e.editor.toLowerCase())
    ).length;
  };

  return (
    <div>
      <Header title="Ekip" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Ekip"
          subtitle="Ekip üyeleri ve görev atamaları"
          icon={Users}
          action={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" /> Yeni Üye
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Ekip Üyesi Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad Soyad</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Caner Yılmaz"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol / Ünvan</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="Kurgucu">Kurgucu</option>
                      <option value="Kameraman">Kameraman</option>
                      <option value="Yönetmen">Yönetmen</option>
                      <option value="Sosyal Medya Uzmanı">Sosyal Medya Uzmanı</option>
                      <option value="Grafiker">Grafiker</option>
                      <option value="Prodüktör">Prodüktör</option>
                    </select>
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
                    <Label htmlFor="color">Profil Rengi</Label>
                    <select
                      id="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="bg-blue-500">Mavi</option>
                      <option value="bg-purple-500">Mor</option>
                      <option value="bg-emerald-500">Yeşil</option>
                      <option value="bg-amber-500">Turuncu</option>
                      <option value="bg-pink-500">Pembe</option>
                      <option value="bg-red-500">Kırmızı</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full mt-4">
                    Kaydet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          }
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {ekip.map((member) => {
            const activeEdits = getActiveEditsCount(member.name);
            return (
              <Card key={member.id} className="p-6 bg-card border-border flex flex-col items-center text-center relative group">
                <button
                  onClick={() => deleteEkipUyesi(member.id)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className={`w-16 h-16 rounded-full ${member.color} text-white flex items-center justify-center text-xl font-bold mb-4 shadow-md`}>
                  {member.initials}
                </div>
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <Badge variant="secondary" className="mb-4">{member.role}</Badge>

                <div className="w-full space-y-3 mt-2 text-sm text-muted-foreground border-t border-border pt-4">
                  <div className="flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2" /> {member.phone}
                  </div>
                  <div className="flex items-center justify-center">
                    <Video className="w-4 h-4 mr-2" /> {activeEdits} Aktif Görev
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
