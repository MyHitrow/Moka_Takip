import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Camera } from 'lucide-react';

export default function YeniCekimPage() {
  return (
    <div>
      <Header title="Yeni Çekim" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader title="Yeni Çekim Ekle" icon={Camera} />
        <div className="mt-6">
          <EmptyState title="Çekim ekleme formu yakında eklenecek" description="Bu sayfa yapım aşamasındadır." icon={Camera} />
        </div>
      </div>
    </div>
  );
}
