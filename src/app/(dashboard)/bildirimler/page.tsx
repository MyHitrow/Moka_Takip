import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Bell, Film, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BildirimlerPage() {
  const notifications = [
    { id: 1, title: 'Yeni Edit Atandı', message: 'Menü Reels kurgusu için görevlendirildiniz.', time: '10 dakika önce', icon: Film, unread: true },
    { id: 2, title: 'Çekim Tamamlandı', message: 'Zirve Mimarlık ofis çekimi tamamlandı olarak işaretlendi.', time: '2 saat önce', icon: CheckCircle2, unread: true },
    { id: 3, title: 'Ödeme Gecikmesi', message: 'Lezzet Dünyası faturası vade tarihini geçti.', time: '1 gün önce', icon: AlertCircle, unread: false },
    { id: 4, title: 'Edit Onaylandı', message: 'Youtube Vlog müşteri tarafından onaylandı.', time: '2 gün önce', icon: CheckCircle2, unread: false },
    { id: 5, title: 'Yeni Müşteri Eklendi', message: 'Sisteme yeni bir işletme kaydı yapıldı: Fitness Club', time: '3 gün önce', icon: Bell, unread: false },
  ];

  return (
    <div>
      <Header title="Bildirimler" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader 
          title="Bildirimler" 
          subtitle="Panel bildirimleri" 
          icon={Bell} 
        />
        <div className="mt-6 space-y-3 max-w-3xl">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <Card 
                key={notif.id} 
                className={`p-4 bg-card border-border flex items-start gap-4 transition-colors ${
                  notif.unread ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className={`p-2 rounded-full mt-1 ${notif.unread ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={`font-medium ${notif.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {notif.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
