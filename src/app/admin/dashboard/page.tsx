'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  newsCount: number;
  achievementsCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    newsCount: 0,
    achievementsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user info
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Get news count
        const { count: newsCount, error: newsError } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true });

        if (newsError) throw newsError;

        // Get achievements count
        const { count: achievementsCount, error: achievementsError } = await supabase
          .from('achievements')
          .select('*', { count: 'exact', head: true });

        if (achievementsError) throw achievementsError;

        setStats({
          newsCount: newsCount || 0,
          achievementsCount: achievementsCount || 0,
        });
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        setError(error.message || 'Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading Dashboard...</div>
          <div className="text-muted-foreground">Please wait while we fetch your data.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold text-destructive">Error Loading Dashboard</div>
          <div className="text-muted-foreground mb-6">{error}</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.email || 'Administrator'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>News Articles</CardTitle>
            <CardDescription>Manage school news and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.newsCount}</div>
            <p className="text-xs text-muted-foreground">Total news articles</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/news">Manage News</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Manage student and school achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.achievementsCount}</div>
            <p className="text-xs text-muted-foreground">Total achievements</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/admin/achievements">Manage Achievements</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Website Preview</CardTitle>
            <CardDescription>View your public website</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              See how your content appears to visitors on the public-facing website.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/" target="_blank">View Website</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button asChild variant="outline" size="lg" className="h-24">
            <Link href="/admin/news/new">
              <div className="flex flex-col items-center justify-center">
                <span className="text-lg font-medium">Add News</span>
                <span className="text-xs text-muted-foreground">Create a new news article</span>
              </div>
            </Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="h-24">
            <Link href="/admin/achievements/new">
              <div className="flex flex-col items-center justify-center">
                <span className="text-lg font-medium">Add Achievement</span>
                <span className="text-xs text-muted-foreground">Record a new achievement</span>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 