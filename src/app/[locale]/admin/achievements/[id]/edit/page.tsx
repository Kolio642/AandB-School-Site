'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LocalizedAdminAchievementEditPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const { id } = params;

  // Use useLayoutEffect for faster redirect before render
  useLayoutEffect(() => {
    // Redirect to the non-localized admin achievements edit route
    window.location.replace(`/admin/achievements/${id}/edit`);
  }, [id]);

  // Minimal rendering for faster load
  return null;
} 