'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/data-context';
import { UserPermissions } from '@/types/app';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: keyof UserPermissions;
}

export function PermissionGuard({ children, requiredPermission }: PermissionGuardProps) {
  const { currentUser } = useData();

  // Super admin tüm sayfalara ve yetkilere tam erişime sahiptir
  if (currentUser.role === 'super_admin') {
    return <>{children}</>;
  }

  // Belirli bir izin tanımlı ve kullanıcının o izni yoksa erişimi engelle
  if (requiredPermission && !currentUser.permissions?.[requiredPermission]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-5 shadow-lg shadow-red-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#F7F7F8] tracking-tight">Kısıtlı Erişim / Yetkiniz Yok</h2>
        <p className="text-sm text-[#73767E] max-w-md mt-2 leading-relaxed">
          Bu sayfayı görüntülemek için gerekli olan erişim yetkisine sahip değilsiniz. Yetki tanımlaması için lütfen <strong className="text-white">Süper Admin</strong> ile iletişime geçin.
        </p>

        <div className="mt-6">
          <Link href="/">
            <Button className="bg-[#17181B] hover:bg-[#24262B] text-white border border-[#2B2D32] gap-2">
              <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
