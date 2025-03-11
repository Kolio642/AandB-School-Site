'use client';

import { useEffect } from 'react';
import { defaultLocale } from '@/lib/i18n';

export default function RootPage() {
  useEffect(() => {
    window.location.href = `/${defaultLocale}`;
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <p>Redirecting to /{defaultLocale}...</p>
    </div>
  );
} 