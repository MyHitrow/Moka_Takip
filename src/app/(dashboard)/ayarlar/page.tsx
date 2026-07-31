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
import { Settings, ShieldCheck, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useData, SystemUser } from '@/context/data-context';

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
  const [role, setRole] = useState<SystemUser['role']>('admin');

  // Edit User state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<SystemUser['role']>('admin');

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
        canManageFinance: role === 'admin' || role === 'super_admin',
        canManageShoots: true,
        canManageEdits: true,
        canManageTakvim: true,
        canManageTeam: role === 'admin' || role === 'super_admin',
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
      case 'super_admin':
        return <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold">Süper Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold">Admin</Badge>;
      case 'editor':
        return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">Kurgucu / Editör</Badge>;
      default:
        return <Badge variant="secondary" className="font-semibold">Ekip Üyesi</Badge>;
    }
  };

  return (
    <div>
      <Header title="Ayarlar" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader
          title="Ayarlar & Kullanıcı Yönetimi"
          subtitle="Kullanıcı oluşturma, rol değiştirme ve yetki kontrolü"
          icon={Settings}
        />

        <div className="mt-6 space-y-6">
          {/* Active Profile Info */}
          <Card className="p-6 bg-card border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold border border-primary/30">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{currentUser.name}</h3>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kullanıcı Adı: <span className="text-foreground font-mono font-bold">@{currentUser.username}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={logout} className="text-xs font-semibold">
                  Oturumu Kapat
                </Button>
              </div>
            </div>
          </Card>

          {/* User Management Section */}
          <Card className="p-6 bg-card border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">Sistem Kullanıcıları & Rol Yönetimi</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Kullanıcı isimleri, kullanıcı adları, şifreler ve kullanıcı rolleri buradan değiştirilebilir. Değişiklikler Ekip sayfasıyla anında eşzamanlanır.
                </p>
              </div>

              {isSuperAdmin && (
                <Dialog open={openUserModal} onOpenChange={setOpenUserModal}>
                  <DialogTrigger
                    render={
                      <Button className="bg-primary hover:bg-primary/90 text-white font-bold">
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
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
                        >
                          <option value="admin">Admin (Yönetici)</option>
                          <option value="editor">Editör / İçerik Üretici</option>
                          <option value="member">Ekip Üyesi</option>
                          <option value="super_admin">Süper Admin</option>
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

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 rounded-l">Kullanıcı Adı</th>
                    <th className="px-4 py-3">Ad Soyad</th>
                    <th className="px-4 py-3">Şifre</th>
                    <th className="px-4 py-3">Sistem Rolü</th>
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
                        <td className="px-4 py-3.5 font-mono text-xs text-foreground font-semibold">
                          {user.password || '******'}
                        </td>
                        <td className="px-4 py-3.5">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isSuperAdmin && (
                              <button
                                onClick={() => handleStartEdit(user)}
                                className="text-muted-foreground hover:text-primary transition-colors p-1 flex items-center gap-1 text-xs font-semibold"
                                title="Kullanıcı Bilgilerini & Rolünü Düzenle"
                              >
                                <Edit className="w-4 h-4" /> Düzenle
                              </button>
                            )}

                            {isSuperAdmin && !isProtected && !isSelf && (
                              <button
                                onClick={() => deleteSystemUser(user.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                title="Kullanıcıyı Sil"
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
      </div>

      {/* EDIT USER & ROLE MODAL */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
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
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground"
              >
                <option value="admin">Admin (Yönetici)</option>
                <option value="editor">Editör / İçerik Üretici</option>
                <option value="member">Ekip Üyesi</option>
                <option value="super_admin">Süper Admin</option>
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
