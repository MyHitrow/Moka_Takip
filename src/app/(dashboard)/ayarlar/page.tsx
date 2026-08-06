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
import { Settings, ShieldCheck, Plus, Trash2, Eye, EyeOff, Copy, Check, Cloud, Database, AlertTriangle, Key } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function AyarlarPage() {
  const { systemUsers, currentUser, isCloudConnected, addSystemUser, deleteSystemUser } = useData();

  const [openUserModal, setOpenUserModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for new user creation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('admin');

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyCredentials = (user: typeof systemUsers[0]) => {
    const text = `Panel Giriş Bilgileri:\nKullanıcı Adı: ${user.username}\nŞifre: ${user.password || '123456'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        subtitle="Panele giriş yetkisi olan kişileri görün, şifrelerini kopyalayın ve yeni kullanıcı ekleyin."
        icon={Settings}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Kullanıcı Yönetimi Kartı */}
        <Card className="p-6 bg-[#111214] border-[#2B2D32]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> Panel Giriş Hesapları & Şifreler
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Panele erişim vereceğiniz kişiler için kullanıcı adı ve şifre oluşturun veya kopyalayın.
              </p>
            </div>

            <Dialog open={openUserModal} onOpenChange={setOpenUserModal}>
              <DialogTrigger
                render={
                  <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs shrink-0">
                    <Plus className="w-4 h-4 mr-1.5" /> Yeni Kullanıcı Hesabı Ekle
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-[425px] bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Yeni Panel Giriş Hesabı Ekle</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                  {errorMsg && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="addName">Ad Soyad / İsim</Label>
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
                      placeholder="Giriş şifresi (Örn: 123456)"
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
                    Kullanıcı Hesabını Oluştur
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* User List Table */}
          <div className="space-y-3">
            {systemUsers.map((user) => {
              const isSelf = user.username === currentUser.username;
              const isProtected = user.username === 'admin';
              const showPass = visiblePasswords[user.id] || false;
              const userPass = user.password || '123456';

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-xl border border-border bg-card/60 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/40"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{user.name}</span>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {user.role === 'super_admin' ? '👑 Süper Admin' : '🏢 Admin'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-muted-foreground font-mono">
                          Kullanıcı Adı: <strong className="text-foreground">@{user.username}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Password & Copy Controls */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border/40 justify-between md:justify-end">
                    <div className="flex items-center gap-2 bg-muted/40 border border-border px-3 py-1.5 rounded-lg text-xs font-mono">
                      <span className="text-muted-foreground">Şifre:</span>
                      <span className="font-bold text-foreground">
                        {showPass ? userPass : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="text-muted-foreground hover:text-foreground ml-1 p-0.5"
                        title={showPass ? 'Şifreyi Gizle' : 'Şifreyi Göster'}
                      >
                        {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCredentials(user)}
                      className="text-xs border-border bg-background hover:bg-muted font-semibold gap-1.5 h-8"
                      title="Giriş bilgilerini kopyala"
                    >
                      {copiedId === user.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Kopyalandı!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Kopyala
                        </>
                      )}
                    </Button>

                    {!isProtected && !isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSystemUser(user.id)}
                        className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8 p-0"
                        title="Kullanıcıyı Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
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
                <p className="text-xs text-muted-foreground">system_users Tablosu</p>
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
