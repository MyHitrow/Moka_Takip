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
import { Settings, ShieldCheck, Plus, Trash2, Edit, AlertTriangle, Sparkles, Scale, Megaphone, Flame, User } from 'lucide-react';
import { useData, SystemUser, formatRoleLabel } from '@/context/data-context';

export default function AyarlarPage() {
  const { systemUsers, currentUser, addSystemUser, updateSystemUser, deleteSystemUser, logout } = useData();
  const [openUserModal, setOpenUserModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for new user creation
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<SystemUser['role']>('creative_director');

  // Edit User state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<SystemUser['role']>('creative_director');

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
        canManageFinance: true,
        canManageShoots: true,
        canManageEdits: true,
        canManageTakvim: true,
        canManageTeam: true,
        canManageUsers: role === 'super_admin',
      },
    });

    if (success) {
      setUsername('');
      setPassword('');
      setName('');
      setRole('creative_director');
      setOpenUserModal(false);
    } else {
      setErrorMsg('Bu kullanıcı adı zaten kullanılıyor veya yetkiniz yetersiz!');
    }
  };

  const handleStartEdit = (user: SystemUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setOpenEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName || !editUsername) return;

    updateSystemUser(editingUser.id, {
      name: editName,
      username: editUsername.trim(),
      password: editPassword || editingUser.password,
      role: editRole,
    });

    setOpenEditModal(false);
    setEditingUser(null);
  };

  const getRoleBadge = (userRole: SystemUser['role']) => {
    switch (userRole) {
      case 'creative_director':
        return (
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 font-extrabold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" /> Creative Director
          </Badge>
        );
      case 'avukat':
        return (
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 font-extrabold flex items-center gap-1">
            <Scale className="w-3 h-3 text-blue-400" /> Avukat
          </Badge>
        );
      case 'ads_specialist':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-extrabold flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-emerald-400" /> Ads Uzmanı
          </Badge>
        );
      case 'herbokolog':
        return (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 font-extrabold flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Herbokolog
          </Badge>
        );
      case 'super_admin':
        return <Badge className="bg-red-500/20 text-red-300 border-red-500/40 font-extrabold">Süper Admin</Badge>;
      case 'admin':
        return <Badge className="bg-primary/20 text-primary border-primary/40 font-bold">Admin</Badge>;
      default:
        return <Badge variant="secondary" className="font-semibold">{formatRoleLabel(userRole)}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Header title="Ayarlar" />
      <PageHeader
        title="Ayarlar & Özel Rol Yönetimi"
        subtitle="Kullanıcı oluşturma, rol değiştirme ve yetki kontrolü"
        icon={Settings}
      />

      <div className="space-y-6">
        {/* Active Profile Info */}
        <Card className="p-5 md:p-6 bg-card border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg md:text-xl font-bold border border-primary/30 shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base md:text-lg font-bold text-foreground truncate">{currentUser.name}</h3>
                  {getRoleBadge(currentUser.role)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Kullanıcı Adı: <span className="text-foreground font-mono font-bold">@{currentUser.username}</span>
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={logout} className="text-xs font-semibold w-full sm:w-auto">
              Oturumu Kapat
            </Button>
          </div>
        </Card>

        {/* User Management Section */}
        <Card className="p-4 md:p-6 bg-card border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-base md:text-lg font-bold text-foreground">Sistem Kullanıcıları & Özel Roller</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Creative Director, Avukat, Ads Uzmanı ve Herbokolog rolleri arasında geçiş yapabilirsiniz.
              </p>
            </div>

            {isSuperAdmin && (
              <Dialog open={openUserModal} onOpenChange={setOpenUserModal}>
                <DialogTrigger
                  render={
                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold w-full sm:w-auto">
                      <Plus className="w-4 h-4 mr-2" /> Yeni Kullanıcı Ekle
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[450px] bg-card border-border max-h-[90vh] overflow-y-auto">
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
                      <Label htmlFor="newPass">Giriş Şifresi</Label>
                      <Input
                        id="newPass"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Örn: 123456"
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
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm font-semibold text-foreground"
                      >
                        <option value="creative_director">✨ Creative Director</option>
                        <option value="avukat">⚖️ Avukat</option>
                        <option value="ads_specialist">📢 Ads Uzmanı</option>
                        <option value="herbokolog">🔥 Herbokolog</option>
                        <option value="super_admin">👑 Süper Admin</option>
                        <option value="admin">🏢 Admin (Yönetici)</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold">
                      Kullanıcıyı Kaydet
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Card List (md:hidden) */}
          <div className="block md:hidden space-y-3">
            {systemUsers.map((user) => {
              const isSelf = user.username === currentUser.username;
              const isProtected = user.username === 'kadorizator';

              return (
                <div
                  key={user.id}
                  className="p-4 rounded-xl border border-border bg-card/50 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">{user.name}</span>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <span>@{user.username}</span>
                    <span className="font-mono">••••••••</span>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
                      <button
                        onClick={() => handleStartEdit(user)}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <Edit className="w-3.5 h-3.5" /> Düzenle
                      </button>
                      {!isProtected && !isSelf && (
                        <button
                          onClick={() => deleteSystemUser(user.id)}
                          className="text-xs font-semibold text-red-400 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Sil
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 rounded-l">Kullanıcı Adı</th>
                  <th className="px-4 py-3">Ad Soyad</th>
                  <th className="px-4 py-3">Şifre</th>
                  <th className="px-4 py-3">Özel Rolü</th>
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
                      <td className="px-4 py-3.5 text-foreground font-medium">{user.name}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        {'••••••••'}
                      </td>
                      <td className="px-4 py-3.5">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleStartEdit(user)}
                              className="text-muted-foreground hover:text-primary transition-colors p-1 flex items-center gap-1 text-xs font-semibold"
                            >
                              <Edit className="w-4 h-4" /> Düzenle
                            </button>
                          )}

                          {isSuperAdmin && !isProtected && !isSelf && (
                            <button
                              onClick={() => deleteSystemUser(user.id)}
                              className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* EDIT USER & ROLE MODAL */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Bilgilerini & Rolünü Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="editNameInput">Ad Soyad</Label>
              <Input
                id="editNameInput"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editUsernameInput">Kullanıcı Adı</Label>
              <Input
                id="editUsernameInput"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPasswordInput">Giriş Şifresi</Label>
              <Input
                id="editPasswordInput"
                type="text"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Yeni Şifre"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRoleSelect">Kullanıcı Rolü</Label>
              <select
                id="editRoleSelect"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as any)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm font-semibold text-foreground"
              >
                <option value="creative_director">✨ Creative Director</option>
                <option value="avukat">⚖️ Avukat</option>
                <option value="ads_specialist">📢 Ads Uzmanı</option>
                <option value="herbokolog">🔥 Herbokolog</option>
                <option value="super_admin">👑 Süper Admin</option>
                <option value="admin">🏢 Admin (Yönetici)</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold">
              Değişiklikleri Kaydet & Ekiple Eşzamanla
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
