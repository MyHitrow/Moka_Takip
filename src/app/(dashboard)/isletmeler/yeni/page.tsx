import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Building2 } from 'lucide-react';

export default function YeniIsletmePage() {
  return (
    <div>
      <Header title="Yeni İşletme" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader title="Yeni İşletme Ekle" icon={Building2} />
        <div className="mt-6">
          <EmptyState title="İşletme ekleme formu yakında eklenecek" description="Bu sayfa yapım aşamasındadır." icon={Building2} />
        </div>
      </div>
    </div>
  );
}
