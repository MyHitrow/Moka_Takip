'use client';

import React from 'react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

/**
 * PermissionGuard — geçici olarak devre dışı.
 * Tüm kullanıcılar tüm sayfalara erişebilir.
 * İleride yeniden aktifleştirilecek.
 */
export function PermissionGuard({ children }: PermissionGuardProps) {
  return <>{children}</>;
}
