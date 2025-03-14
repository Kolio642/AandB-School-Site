'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAchievements(achievements.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting achievement:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Achievements Management</h1>
        <Link
          href="/admin/achievements/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
        >
          Add Achievement
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {achievements.map((achievement) => (
            <li key={achievement.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {achievement.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(achievement.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4">
                    <Link
                      href={`/admin/achievements/${achievement.id}/edit`}
                      className="text-primary hover:text-primary/80"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {achievements.length === 0 && (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              No achievements found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 