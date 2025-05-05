'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocalizedAdminDashboardPage() {
  const router = useRouter();

  // Use useLayoutEffect for faster redirect before render
  useLayoutEffect(() => {
    // Redirect to the non-localized admin dashboard
    window.location.replace('/admin/dashboard');
  }, []);

  // Minimal rendering for faster load
  return null;
} 