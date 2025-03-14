'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AchievementForm from '@/components/admin/achievement-form';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

export default function EditAchievementPage({ params }: { params: { id: string } }) {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievement();
  }, [params.id]);

  async function fetchAchievement() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setAchievement(data);
    } catch (error) {
      console.error('Error fetching achievement:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = async (data: { title: string; description: string; date: string }) => {
    const { error } = await supabase
      .from('achievements')
      .update(data)
      .eq('id', params.id);

    if (error) throw error;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Achievement not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The achievement you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit Achievement</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the achievement details below.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <AchievementForm initialData={achievement} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
} 