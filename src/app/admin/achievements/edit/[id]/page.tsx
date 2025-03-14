'use client';

import { AchievementForm } from '@/components/admin/achievement-form';

interface EditAchievementPageProps {
  params: {
    id: string;
  };
}

export default function EditAchievementPage({ params }: EditAchievementPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Achievement</h1>
        <p className="text-muted-foreground mt-2">
          Make changes to an existing achievement
        </p>
      </div>
      
      <AchievementForm achievementId={params.id} />
    </div>
  );
} 