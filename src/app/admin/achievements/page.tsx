'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Loader2, RefreshCcw } from 'lucide-react';

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
  const pathname = usePathname();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function for hard navigation
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  const fetchAchievements = async (refresh: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching achievements data...');
      
      // First check auth session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current auth session:', session ? 'Active' : 'None');
      
      // Use the appropriate client
      const client = session ? supabase : supabaseAdmin;
      console.log('Using client:', session ? 'User client' : 'Admin client');
      
      const { data, error } = await client
        .from('achievements')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Database error during fetch:', error);
        throw error;
      }

      console.log('Achievements data received:', data?.length || 0, 'records');
      setAchievements(data || []);
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      setError(error.message || 'Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on initial load
  useEffect(() => {
    fetchAchievements();
  }, []);

  // Fetch when pathname changes to this page
  useEffect(() => {
    if (pathname === '/admin/achievements') {
      console.log('Achievements page is active, refreshing data');
      fetchAchievements();
    }
  }, [pathname]);

  // Refresh data when window gains focus (for when user navigates back to the tab)
  useEffect(() => {
    const handleFocus = () => {
      if (pathname === '/admin/achievements') {
        console.log('Window focused on achievements page, refreshing data');
        fetchAchievements();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [pathname]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('Deleting achievement with ID:', id);
      
      // Use direct fetch with service role key
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/achievements?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'apikey': apiKey,
            'Prefer': 'return=minimal',
          },
        }
      );

      if (!response.ok) {
        console.error('Delete failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Delete failed with status ${response.status}: ${errorText}`);
      }
      
      console.log('Delete HTTP response:', response.status, response.statusText);
      console.log('Achievement deleted successfully');
      
      // Update local state immediately
      setAchievements(prevItems => prevItems.filter(achievement => achievement.id !== id));
      
      // Refresh data from server after a short delay
      setTimeout(() => {
        fetchAchievements(true);
      }, 500);
      
      // Show success message
      alert('Achievement deleted successfully');
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      // More detailed error information
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
      if (error.details) {
        console.error(`Error details: ${error.details}`);
      }
      alert(`Error deleting achievement: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
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

  const handleRefresh = () => {
    fetchAchievements();
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
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
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Achievements Management</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => navigateTo('/admin/achievements/new')}>Add Achievement</Button>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-semibold">No achievements found</h3>
          <p className="text-muted-foreground mt-2">Get started by creating your first achievement.</p>
          <Button className="mt-4" onClick={() => navigateTo('/admin/achievements/new')}>
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
                          onClick={() => navigateTo(`/admin/achievements/edit/${item.id}`)}
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