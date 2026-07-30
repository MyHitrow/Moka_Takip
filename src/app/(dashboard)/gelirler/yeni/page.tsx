import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { TrendingUp } from 'lucide-react';

export default function YeniGelirPage() {
  return (
    <div>
      <Header title="Yeni Gelir" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader title="Yeni Gelir Ekle" icon={TrendingUp} />
        <div className="mt-6">
          <EmptyState title="Gelir ekleme formu yakında eklenecek" description="Bu sayfa yapım aşamasındadır." icon={TrendingUp} />
        </div>
      </div>
    </div>
  );
}
