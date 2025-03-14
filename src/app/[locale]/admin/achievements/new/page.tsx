'use client';

import { supabase } from '@/lib/supabase';
import AchievementForm from '@/components/admin/achievement-form';

export default function NewAchievementPage() {
  const handleSubmit = async (data: { title: string; description: string; date: string }) => {
    const { error } = await supabase
      .from('achievements')
      .insert([data]);

    if (error) throw error;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create Achievement</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new achievement to be displayed on the website.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <AchievementForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
} 