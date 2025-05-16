'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { PlusCircle, Trophy, Users, BookOpen } from 'lucide-react';

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

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the A&B School admin panel. Manage your school's content easily.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total News</CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <PlusCircle className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-blue-700">{stats?.newsCount || 0}</div>
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => navigateTo('/admin/news')}
                  >
                    View All
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs bg-blue-500 hover:bg-blue-600"
                    onClick={() => navigateTo('/admin/news/new')}
                  >
                    Add New
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Achievements</CardTitle>
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-amber-700">{stats?.achievementsCount || 0}</div>
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => navigateTo('/admin/achievements')}
                  >
                    View All
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs bg-amber-500 hover:bg-amber-600"
                    onClick={() => navigateTo('/admin/achievements/new')}
                  >
                    Add New
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teachers</CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-green-700">{stats?.teachersCount || 0}</div>
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => navigateTo('/admin/teachers')}
                  >
                    View All
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs bg-green-500 hover:bg-green-600"
                    onClick={() => navigateTo('/admin/teachers/new')}
                  >
                    Add New
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-md hover:shadow-lg transition-all">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Courses</CardTitle>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-3xl font-bold text-purple-700">{stats?.coursesCount || 0}</div>
                <div className="flex justify-between items-center mt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => navigateTo('/admin/courses')}
                  >
                    View All
                  </Button>
                  <Button 
                    size="sm" 
                    className="text-xs bg-purple-500 hover:bg-purple-600"
                    onClick={() => navigateTo('/admin/courses/new')}
                  >
                    Add New
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 