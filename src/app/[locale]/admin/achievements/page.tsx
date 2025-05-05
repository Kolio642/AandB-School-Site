'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocalizedAdminAchievementsPage() {
  const router = useRouter();

  // Use useLayoutEffect for faster redirect before render
  useLayoutEffect(() => {
    // Redirect to the non-localized admin achievements route
    window.location.replace('/admin/achievements');
  }, []);

  // Minimal rendering for faster load
  return null;
} 