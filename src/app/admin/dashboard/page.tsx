'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  newsCount: number;
  achievementsCount: number;
  teachersCount: number;
  coursesCount: number;
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/admin');
    } else if (user) {
      fetchDashboardStats();
    }
  }, [user, isLoading, router]);

  async function fetchDashboardStats() {
    setIsLoadingStats(true);
    try {
      // Fetch news count
      const { count: newsCount, error: newsError } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });

      // Fetch achievements count
      const { count: achievementsCount, error: achievementsError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });

      // Fetch teachers count
      const { count: teachersCount, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      // Fetch courses count
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      if (newsError || achievementsError || teachersError || coursesError) {
        console.error('Error fetching dashboard stats:', {
          newsError,
          achievementsError,
          teachersError,
          coursesError
        });
        return;
      }

      setStats({
        newsCount: newsCount || 0,
        achievementsCount: achievementsCount || 0,
        teachersCount: teachersCount || 0,
        coursesCount: coursesCount || 0
      });
    } catch (error) {
      console.error('Unexpected error fetching dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the A&B School admin panel. Here you can manage news, achievements, teachers, and courses.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total News</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.newsCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              <a href="/admin/news" className="text-primary hover:underline">Manage News →</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.achievementsCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              <a href="/admin/achievements" className="text-primary hover:underline">Manage Achievements →</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.teachersCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              <a href="/admin/teachers" className="text-primary hover:underline">Manage Teachers →</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-7 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats?.coursesCount || 0}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              <a href="/admin/courses" className="text-primary hover:underline">Manage Courses →</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 