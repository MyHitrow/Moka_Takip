import { Header } from '@/components/layout/header';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Building2 } from 'lucide-react';

export default function IsletmeDetayPage() {
  return (
    <div>
      <Header title="İşletme Detayı" />
      <div className="px-4 lg:px-8 pb-8">
        <PageHeader title="İşletme Detayı" icon={Building2} />
        <div className="mt-6">
          <EmptyState title="İşletme detayı yakında eklenecek" description="Bu sayfa yapım aşamasındadır." icon={Building2} />
        </div>
      </div>
    </div>
  );
}
