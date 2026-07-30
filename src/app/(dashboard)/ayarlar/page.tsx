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
import { Settings, User, Shield, ShieldCheck, Plus, Trash2, Key, UserCheck, AlertTriangle } from 'lucide-react';
import { useData, SystemUser } from '@/context/data-context';

export default function AyarlarPage() {
  const { systemUsers, currentUser, addSystemUser, deleteSystemUser, logout } = useData();
  const [openUserModal, setOpenUserModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for new user creation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<SystemUser['role']>('admin');
  const [canManageFinance, setCanManageFinance] = useState(true);
  const [canManageShoots, setCanManageShoots] = useState(true);
  const [canManageEdits, setCanManageEdits] = useState(true);
  const [canManageTakvim, setCanManageTakvim] = useState(true);
  const [canManageTeam, setCanManageTeam] = useState(false);

  const isSuperAdmin = currentUser.role === 'super_admin';

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username || !password || !name) return;

    const success = addSystemUser({
      username: username.trim(),
      password,
      name,
      role,
      permissions: {
        canManageFinance,
        canManageShoots,
        canManageEdits,
        canManageTakvim,
        canManageTeam,
        canManageUsers: role === 'super_admin',
      },
    });

    if (success) {
      setUsername('');
      setPassword('');
      setName('');
      setRole('admin');
      setOpenUserModal(false);
    } else {
      setErrorMsg('Bu kullanıcı adı zaten kullanılıyor veya yetkiniz yetersiz!');
    }
  };

  const getRoleBadge = (userRole: SystemUser['role']) => {
    switch (userRole) {
      case 'super_admin':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold">Süper Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">Admin</Badge>;
      case 'editor':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Editör</Badge>;
      default:
        return <Badge variant="secondary">Ekip Üyesi</Badge>;
    }
  };

  return (
    <div>
      <Header title="Ayarlar" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Ayarlar & Kullanıcı Yönetimi"
          subtitle="Süper Admin kullanıcı ve yetki kontrol paneli"
          icon={Settings}
        />

        <div className="mt-6 space-y-6">
          {/* Active Profile Info */}
          <Card className="p-6 bg-card border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border border-primary/20">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{currentUser.name}</h3>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kullanıcı Adı: <span className="text-foreground font-mono">@{currentUser.username}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={logout} className="text-xs">
                  Oturumu Kapat
                </Button>
              </div>
            </div>
          </Card>

          {/* User Management Section (SADECE SÜPER ADMİN YÖNETEBİLİR) */}
          <Card className="p-6 bg-card border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-bold">Kullanıcı ve Yetki Yönetimi</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sadece Süper Admin (`kadorizator`) yeni kullanıcı oluşturabilir ve yetki tanımlayabilir.
                </p>
              </div>

              {isSuperAdmin && (
                <Dialog open={openUserModal} onOpenChange={setOpenUserModal}>
                  <DialogTrigger
                    render={
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                        <Plus className="w-4 h-4 mr-2" /> Yeni Kullanıcı Ekle
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-[450px] bg-card border-border">
                    <DialogHeader>
                      <DialogTitle>Yeni Sistem Kullanıcısı Ekle</DialogTitle>
                    </DialogHeader>
                    {errorMsg && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    <form onSubmit={handleAddUser} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="newUsername">Kullanıcı Adı</Label>
                        <Input
                          id="newUsername"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Örn: ahmet_kurgu"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPass">Şifre</Label>
                        <Input
                          id="newPass"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Giriş şifresi"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newName">Ad Soyad</Label>
                        <Input
                          id="newName"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Örn: Ahmet Kurgucu"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newRole">Kullanıcı Rolü</Label>
                        <select
                          id="newRole"
                          value={role}
                          onChange={(e) => setRole(e.target.value as any)}
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="admin">Admin (Yönetici)</option>
                          <option value="editor">Editör / İçerik Üretici</option>
                          <option value="member">Ekip Üyesi</option>
                          <option value="super_admin">Süper Admin</option>
                        </select>
                      </div>

                      {/* Permissions Checklist */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label className="text-xs font-semibold">Sayfa Yetkileri (İzinler)</Label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer bg-muted/40 p-2 rounded border border-border">
                            <input
                              type="checkbox"
                              checked={canManageFinance}
                              onChange={(e) => setCanManageFinance(e.target.checked)}
                            />
                            <span>Finans / Gelirler</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-muted/40 p-2 rounded border border-border">
                            <input
                              type="checkbox"
                              checked={canManageShoots}
                              onChange={(e) => setCanManageShoots(e.target.checked)}
                            />
                            <span>Çekim Yönetimi</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-muted/40 p-2 rounded border border-border">
                            <input
                              type="checkbox"
                              checked={canManageEdits}
                              onChange={(e) => setCanManageEdits(e.target.checked)}
                            />
                            <span>Edit Yönetimi</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer bg-muted/40 p-2 rounded border border-border">
                            <input
                              type="checkbox"
                              checked={canManageTakvim}
                              onChange={(e) => setCanManageTakvim(e.target.checked)}
                            />
                            <span>Paylaşım Takvimi</span>
                          </label>
                        </div>
                      </div>

                      <Button type="submit" className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white">
                        Kullanıcıyı Kaydet
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 rounded-l">Kullanıcı Adı</th>
                    <th className="px-4 py-3">Ad Soyad</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">İzinler</th>
                    <th className="px-4 py-3 text-right rounded-r">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {systemUsers.map((user) => {
                    const isSelf = user.username === currentUser.username;
                    const isProtected = user.username === 'kadorizator';

                    return (
                      <tr key={user.id} className="bg-card hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3.5 font-bold text-foreground flex items-center gap-1.5">
                          <span>@{user.username}</span>
                          {isProtected && (
                            <Badge className="bg-purple-500/20 text-purple-300 text-[10px] py-0 px-1">Ana Süper Admin</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground">{user.name}</td>
                        <td className="px-4 py-3.5">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {user.role === 'super_admin' ? (
                            <span className="text-purple-400 font-semibold">Tam Yetkili</span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.canManageFinance && <span className="bg-muted px-1.5 py-0.5 rounded">Finans</span>}
                              {user.permissions.canManageShoots && <span className="bg-muted px-1.5 py-0.5 rounded">Çekim</span>}
                              {user.permissions.canManageEdits && <span className="bg-muted px-1.5 py-0.5 rounded">Edit</span>}
                              {user.permissions.canManageTakvim && <span className="bg-muted px-1.5 py-0.5 rounded">Takvim</span>}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isSuperAdmin && !isProtected && !isSelf && (
                            <button
                              onClick={() => deleteSystemUser(user.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                              title="Kullanıcıyı Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
