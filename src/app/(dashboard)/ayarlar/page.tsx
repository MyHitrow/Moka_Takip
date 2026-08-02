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
import { normalizeRoleKey } from '@/lib/helpers';
import { PermissionGuard } from '@/components/shared/permission-guard';

export default function AyarlarPage() {
  return (
    <PermissionGuard requiredPermission="canManageUsers">
      <AyarlarPageContent />
    </PermissionGuard>
  );
}

function AyarlarPageContent() {
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
  const [editPermissions, setEditPermissions] = useState<SystemUser['permissions']>({
    canManageClients: true,
    canManageShoots: true,
    canManageEdits: true,
    canManageTakvim: true,
    canManageFinance: true,
    canManageReports: true,
    canManageTeam: true,
    canManageUsers: false,
  });

  const hasSuperAdmin = systemUsers.some((u) => u.role === 'super_admin');
  const isSuperAdmin = currentUser.role === 'super_admin' || !hasSuperAdmin;

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
        canManageClients: true,
        canManageShoots: true,
        canManageEdits: true,
        canManageTakvim: true,
        canManageFinance: role !== 'editor' && role !== 'member',
        canManageReports: role !== 'editor' && role !== 'member',
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
    setEditRole(normalizeRoleKey(user.role));
    setEditPermissions({
      canManageClients: user.permissions?.canManageClients ?? true,
      canManageShoots: user.permissions?.canManageShoots ?? true,
      canManageEdits: user.permissions?.canManageEdits ?? true,
      canManageTakvim: user.permissions?.canManageTakvim ?? true,
      canManageFinance: user.permissions?.canManageFinance ?? true,
      canManageReports: user.permissions?.canManageReports ?? true,
      canManageTeam: user.permissions?.canManageTeam ?? true,
      canManageUsers: user.permissions?.canManageUsers ?? (user.role === 'super_admin'),
    });
    setOpenEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName || !editUsername) return;

    const finalPermissions = editRole === 'super_admin'
      ? {
          canManageClients: true, canManageShoots: true, canManageEdits: true,
          canManageTakvim: true, canManageFinance: true, canManageReports: true,
          canManageTeam: true, canManageUsers: true,
        }
      : editPermissions;

    updateSystemUser(editingUser.id, {
      name: editName,
      username: editUsername.trim(),
      password: editPassword || editingUser.password,
      role: editRole,
      permissions: finalPermissions,
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
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/40 font-extrabold flex items-center gap-1">
            👑 Süper Admin
          </Badge>
        );
      case 'admin':
        return (
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-extrabold flex items-center gap-1">
            🏢 Yönetici
          </Badge>
        );
      case 'editor':
        return (
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/40 font-extrabold flex items-center gap-1">
            🎬 Editör
          </Badge>
        );
      default:
        return (
          <Badge className="bg-zinc-500/20 text-zinc-300 border-zinc-500/40 font-extrabold flex items-center gap-1">
            👤 Ekip Üyesi
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-0 md:pt-5 bg-[#0D0E10] min-h-screen">
      <Header title="Ayarlar" subtitle="Sistem ayarları ve kullanıcı yetkilendirme" />

      <PageHeader
        title="Sistem & Kullanıcı Yetki Ayarları"
        subtitle="Kullanıcı oluştur, roller belirle ve sayfa erişim izinlerini granüler olarak yönet."
        icon={Settings}
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Kullanıcı Yönetimi Kartı */}
        <Card className="p-6 bg-[#111214] border-[#2B2D32]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Sistem Kullanıcıları & Yetkiler</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kullanıcılara sayfa ve finans erişim yetkileri atayın.
              </p>
            </div>

            {isSuperAdmin && (
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
                    <DialogTitle>Yeni Sistem Kullanıcısı Ekle</DialogTitle>
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
                      <Label htmlFor="addPassword">Şifre</Label>
                      <Input
                        id="addPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addRole">Kullanıcı Rolü</Label>
                      <select
                        id="addRole"
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
                        <option value="editor">🎬 Editör / Kurgucu</option>
                        <option value="member">👤 Ekip Üyesi (Member)</option>
                      </select>
                    </div>

                    <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 font-bold">
                      Kullanıcıyı Kaydet
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Mobile Card List */}
          <div className="block md:hidden space-y-3">
            {systemUsers.map((user) => {
              const isSelf = user.username === currentUser.username;
              const isProtected = user.username === 'kadorizator';

              return (
                <div key={user.id} className="p-4 rounded-xl border border-border bg-card/50 flex flex-col gap-3">
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
                        <Edit className="w-3.5 h-3.5" /> Düzenle & İzinler
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

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 rounded-l">Kullanıcı</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3 text-right rounded-r">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {systemUsers.map((user) => {
                  const isSelf = user.username === currentUser.username;
                  const isProtected = user.username === 'kadorizator';
                  return (
                    <tr key={user.id} className="bg-card hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-foreground">
                        {user.name} <span className="text-muted-foreground font-normal">(@{user.username})</span>
                      </td>
                      <td className="px-4 py-3.5">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3.5 text-right">
                        {isSuperAdmin && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStartEdit(user)}
                              className="text-muted-foreground hover:text-primary transition-colors p-1 flex items-center gap-1 text-xs font-semibold"
                            >
                              <Edit className="w-4 h-4" /> İzinleri Düzenle
                            </button>
                            {!isProtected && !isSelf && (
                              <button
                                onClick={() => deleteSystemUser(user.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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

      {/* EDIT USER & GRANULAR PERMISSIONS MODAL */}
      <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
        <DialogContent className="sm:max-w-[480px] bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı İzinlerini & Rolünü Düzenle</DialogTitle>
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
                <option value="super_admin">👑 Süper Admin (Tam Yetkili)</option>
                <option value="admin">🏢 Admin (Yönetici)</option>
                <option value="editor">🎬 Editör / Kurgucu</option>
                <option value="member">👤 Ekip Üyesi (Member)</option>
              </select>
            </div>

            {/* Granüler Modül & Sayfa İzinleri Checkbox Listesi */}
            {editRole !== 'super_admin' && (
              <div className="pt-3 border-t border-border/60 space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Modül & Sayfa Erişim İzinleri
                </Label>
                <div className="grid grid-cols-1 gap-2.5 bg-muted/20 p-3 rounded-xl border border-border/40">
                  <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageClients}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageClients: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>🏢 İşletmeler Modülü</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageShoots}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageShoots: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>🎬 Çekimler Modülü</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageEdits}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageEdits: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>🎞️ Editler / Kurgu Modülü</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageTakvim}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageTakvim: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>📅 Paylaşım Takvimi</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-bold text-amber-400 cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageFinance}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageFinance: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>💰 Finans & Gelir/Gider (Dashboard Finans Grafikleri Dahil)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageReports}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageReports: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>📊 Raporlar & Analizler</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageTeam}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageTeam: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>👥 Ekip Yönetimi Sayfası</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:opacity-90">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageUsers}
                      onChange={(e) => setEditPermissions({ ...editPermissions, canManageUsers: e.target.checked })}
                      className="rounded accent-primary w-4 h-4"
                    />
                    <span>⚙️ Ayarlar & İzin Yönetimi</span>
                  </label>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold">
              Değişiklikleri Kaydet & İzinleri Güncelle
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
