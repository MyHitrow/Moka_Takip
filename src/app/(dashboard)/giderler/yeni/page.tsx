import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { TrendingDown } from 'lucide-react';

export default function YeniGiderPage() {
  return (
    <div>
      <Header title="Yeni Gider" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader title="Yeni Gider Ekle" icon={TrendingDown} />
        <div className="mt-6">
          <EmptyState title="Gider ekleme formu yakında eklenecek" description="Bu sayfa yapım aşamasındadır." icon={TrendingDown} />
        </div>
      </div>
    </div>
  );
}
