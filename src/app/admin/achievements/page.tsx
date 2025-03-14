'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface Achievement {
  id: string;
  created_at: string;
  title_en: string;
  title_bg: string;
  student_name: string | null;
  category: string;
  date: string;
  published: boolean;
}

export default function AdminAchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        setAchievements(data || []);
      } catch (error: any) {
        console.error('Error fetching achievements:', error);
        setError(error.message || 'Failed to load achievements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update the local state
      setAchievements(achievements.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      alert(`Failed to delete: ${error.message}`);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update the local state
      setAchievements(achievements.map(item => 
        item.id === id ? { ...item, published: !currentStatus } : item
      ));
    } catch (error: any) {
      console.error('Error updating achievement:', error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading Achievements...</div>
          <div className="text-muted-foreground">Please wait while we fetch the achievements.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-destructive">Error Loading Achievements</div>
          <div className="text-muted-foreground mb-6">{error}</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Achievements Management</h1>
        <Button onClick={() => router.push('/admin/achievements/new')}>Add Achievement</Button>
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">No achievements found</h3>
          <p className="text-muted-foreground mt-2">Get started by creating your first achievement.</p>
          <Button className="mt-4" onClick={() => router.push('/admin/achievements/new')}>
            Create Achievement
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Achievement</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{item.title_en}</div>
                        <div className="text-sm text-muted-foreground">{item.title_bg}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.student_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(new Date(item.date), 'en-US')}
                    </td>
                    <td className="px-4 py-3">
                      <span 
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          item.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => togglePublished(item.id, item.published)}
                        >
                          {item.published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => router.push(`/admin/achievements/edit/${item.id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 