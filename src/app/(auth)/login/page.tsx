'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Film, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof document !== 'undefined') {
      document.cookie = 'app_session=true; path=/; max-age=2592000; SameSite=Lax';
    }
    router.push('/');
  };

  return (
    <Card className="w-full max-w-md p-8 bg-card border-border shadow-2xl">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-primary/10 p-3 rounded-xl mb-4 text-primary">
          <Film className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">Ajans Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">Giriş Yap ve Yönet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adınız..."
            className="bg-background"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Şifre</Label>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifreniz..."
            className="bg-background"
          />
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 font-semibold mt-2">
          Giriş Yap
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-border flex items-center justify-center text-xs text-muted-foreground">
        <span className="flex items-center gap-1 text-emerald-400/70">
          <ShieldCheck className="w-3.5 h-3.5" /> Güvenli Giriş
        </span>
      </div>
    </Card>
  );
}
