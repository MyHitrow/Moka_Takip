import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, BellRing, Shield } from 'lucide-react';

export default function AyarlarPage() {
  return (
    <div>
      <Header title="Ayarlar" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader 
          title="Ayarlar" 
          subtitle="Panel ayarları" 
          icon={Settings} 
        />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Profil Ayarları</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Ad Soyad</p>
                <p className="text-sm text-muted-foreground">Admin Kullanıcı</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">E-posta</p>
                <p className="text-sm text-muted-foreground">admin@ajans.com</p>
              </div>
              <Button variant="outline" size="sm" className="mt-2">Profili Düzenle</Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-6">
              <BellRing className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Bildirim Ayarları</h3>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Yeni edit eklendiğinde bildir</span>
                <span className="text-primary font-medium">Açık</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Çekim tarihi yaklaştığında bildir</span>
                <span className="text-primary font-medium">Açık</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ödeme gecikmelerini bildir</span>
                <span className="text-primary font-medium">Açık</span>
              </div>
              <Button variant="outline" size="sm" className="mt-4">Tercihleri Değiştir</Button>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Güvenlik</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <p className="text-sm font-medium">Şifre Değiştirme</p>
                <p className="text-xs text-muted-foreground mt-1">Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin.</p>
              </div>
              <Button variant="secondary">Şifre Değiştir</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
