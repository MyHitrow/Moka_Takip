'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, ShieldCheck, Plus, Trash2, User, Cloud, Database, AlertTriangle } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function AyarlarPage() {
  const { systemUsers, currentUser, isCloudConnected, addSystemUser, deleteSystemUser } = useData();

  const [openUserModal, setOpenUserModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for new user creation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('admin');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password || !name.trim()) return;

    const success = await addSystemUser({
      username: username.trim(),
      password,
      name: name.trim(),
      role,
      permissions: {
        canManageClients: true,
        canManageShoots: true,
        canManageEdits: true,
        canManageTakvim: true,
        canManageFinance: true,
        canManageReports: true,
        canManageTeam: true,
        canManageUsers: true,
      },
    });

    if (success) {
      setUsername('');
      setPassword('');
      setName('');
      setRole('admin');
      setOpenUserModal(false);
    } else {
      setErrorMsg('Bu kullanıcı adı zaten kullanılıyor veya bir hata oluştu!');
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-0 md:pt-5 bg-[#0D0E10] min-h-screen">
      <Header title="Ayarlar" subtitle="Sistem ve kullanıcı hesap yönetimi" />

      <PageHeader
        title="Sistem & Kullanıcı Hesap Ayarları"
        subtitle="Panel kullanıcı hesaplarını yönetin, yeni yetkili ekleyin veya silin."
        icon={Settings}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Kullanıcı Yönetimi Kartı */}
        <Card className="p-6 bg-[#111214] border-[#2B2D32]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sistem Kullanıcı Hesapları</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Panele giriş yapabilecek kullanıcı hesaplarını yönetin.
              </p>
            </div>

            <Dialog open={openUserModal} onOpenChange={setOpenUserModal}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs">
                    <Plus className="w-4 h-4 mr-1.5" /> Yeni Kullanıcı Ekle
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Panel Kullanıcısı Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="addName">Ad Soyad</Label>
                    <Input
                      id="addName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: Caner Yılmaz"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addUsername">Kullanıcı Adı</Label>
                    <Input
                      id="addUsername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Örn: caner"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addPassword">Giriş Şifresi</Label>
                    <Input
                      id="addPassword"
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Giriş şifresi"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addRole">Kullanıcı Rolü</Label>
                    <select
                      id="addRole"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                    >
                      <option value="super_admin">👑 Süper Admin</option>
                      <option value="admin">🏢 Yönetici (Admin)</option>
                      <option value="editor">🎬 Editör / Kurgucu</option>
                      <option value="member">👤 Ekip Üyesi</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 font-bold">
                    Kullanıcıyı Kaydet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {systemUsers.map((user) => {
              const isSelf = user.username === currentUser.username;
              const isProtected = user.username === 'admin';

              return (
                <div key={user.id} className="p-4 rounded-xl border border-border bg-card/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{user.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {user.role === 'super_admin' ? '👑 Süper Admin' : '🏢 Admin'}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">@{user.username}</span>
                    </div>
                  </div>

                  {!isProtected && !isSelf && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSystemUser(user.id)}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                      title="Kullanıcıyı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* System & Database Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-[#111214] border-[#2B2D32]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Bulut Bağlantı Durumu</h2>
                <p className="text-xs text-muted-foreground">Supabase Realtime Sync</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Durum</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isCloudConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'}`}>
                {isCloudConnected ? '● Aktif ve Senkronize' : '○ Bağlantı Kuruluyor...'}
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-[#111214] border-[#2B2D32]">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Veri Güvenliği</h2>
                <p className="text-xs text-muted-foreground">system_users & team_members Tablosu</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
              <span className="text-xs font-semibold text-muted-foreground">Güvenlik</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> PostgreSQL RLS Etkin
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
