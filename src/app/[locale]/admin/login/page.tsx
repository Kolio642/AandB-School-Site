'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocalizedAdminLoginPage() {
  const router = useRouter();

  // Use useLayoutEffect for faster redirect before render
  useLayoutEffect(() => {
    // Redirect to the non-localized admin login
    window.location.replace('/admin');
  }, []);

  // Minimal rendering for faster load
  return null;
} 