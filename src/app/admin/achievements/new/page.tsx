'use client';

import { AchievementForm } from '@/components/admin';

export default function NewAchievementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Achievement</h1>
        <p className="text-muted-foreground mt-2">
          Create a new achievement to showcase on the website
        </p>
      </div>
      
      <AchievementForm />
    </div>
  );
} 