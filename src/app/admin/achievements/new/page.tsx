'use client';

import { AchievementForm } from '@/components/admin/achievement-form';

export default function NewAchievementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Achievement</h1>
        <p className="text-muted-foreground mt-2">
          Add a new achievement to the website
        </p>
      </div>
      
      <AchievementForm />
    </div>
  );
} 