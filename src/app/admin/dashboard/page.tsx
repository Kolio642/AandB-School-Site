'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2, Eye, ArrowUpRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface NewsItem {
  id: string;
  title_en: string;
  date: string;
  published: boolean;
}

interface Achievement {
  id: string;
  title_en: string;
  date: string;
  published: boolean;
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Set component as mounted
  useEffect(() => {
    setMounted(true);
    console.log('Dashboard mounted, checking auth state');
    
    // Force refresh auth state on dashboard load
    const refreshAuth = async () => {
      try {
        const supabase = createClientComponentClient();
        await supabase.auth.getUser();
      } catch (error) {
        console.error('Error refreshing auth state:', error);
      }
    };
    
    refreshAuth();
  }, []);

  // Handle unauthenticated users
  useEffect(() => {
    if (mounted && !isLoading && !user) {
      console.log('No user in dashboard, redirecting to login');
      window.location.replace('/admin');
    }
  }, [mounted, isLoading, user]);
  
  // Load dashboard data when user is authenticated
  useEffect(() => {
    async function fetchRecentItems() {
      try {
        // Fetch recent news items
        const { data: newsData, error: newsError } = await supabase
          .from('news')
          .select('id, title_en, date, published')
          .order('date', { ascending: false })
          .limit(3);

        if (newsError) throw newsError;
        setRecentNews(newsData || []);

        // Fetch recent achievements
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('achievements')
          .select('id, title_en, date, published')
          .order('date', { ascending: false })
          .limit(3);

        if (achievementsError) throw achievementsError;
        setRecentAchievements(achievementsData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    }

    if (mounted && user) {
      fetchRecentItems();
    }
  }, [mounted, user]);

  // Handle navigation with hard redirects instead of client routing
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  if (!mounted || isLoading || dashboardLoading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="mb-4 text-2xl font-bold">Loading...</div>
            <div className="text-muted-foreground">Please wait while we load your dashboard.</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigateTo('/admin/news/new')} size="sm">
            <Plus className="mr-1 h-4 w-4" /> New News
          </Button>
          <Button onClick={() => navigateTo('/admin/achievements/new')} size="sm">
            <Plus className="mr-1 h-4 w-4" /> New Achievement
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>You are logged in as {user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Use the dashboard to manage content for the A&B School website.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigateTo('/')}>
              <Eye className="mr-1 h-4 w-4" /> View Website
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              News Management
              <Button variant="ghost" size="sm" onClick={() => navigateTo('/admin/news')}>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>Manage news articles</CardDescription>
          </CardHeader>
          <CardContent className="h-[120px] overflow-y-auto">
            {recentNews.length > 0 ? (
              <ul className="space-y-2">
                {recentNews.map(item => (
                  <li key={item.id} className="text-sm border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate max-w-[180px]">{item.title_en}</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => navigateTo(`/admin/news/edit/${item.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDate(item.date)}</span>
                      <span className={item.published ? 'text-green-600' : 'text-amber-600'}>
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No news items yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigateTo('/admin/news/new')} variant="outline" className="w-full">
              <Plus className="mr-1 h-4 w-4" /> Add News
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              Achievements 
              <Button variant="ghost" size="sm" onClick={() => navigateTo('/admin/achievements')}>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>Manage student achievements</CardDescription>
          </CardHeader>
          <CardContent className="h-[120px] overflow-y-auto">
            {recentAchievements.length > 0 ? (
              <ul className="space-y-2">
                {recentAchievements.map(item => (
                  <li key={item.id} className="text-sm border-b pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate max-w-[180px]">{item.title_en}</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => navigateTo(`/admin/achievements/edit/${item.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatDate(item.date)}</span>
                      <span className={item.published ? 'text-green-600' : 'text-amber-600'}>
                        {item.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No achievements yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigateTo('/admin/achievements/new')} variant="outline" className="w-full">
              <Plus className="mr-1 h-4 w-4" /> Add Achievement
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button onClick={() => navigateTo('/admin/news')} variant="outline" className="justify-start">
                <ArrowUpRight className="mr-2 h-4 w-4" /> News Management
              </Button>
              <Button onClick={() => navigateTo('/admin/achievements')} variant="outline" className="justify-start">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Achievements Management
              </Button>
              <Button onClick={() => navigateTo('/')} variant="outline" className="justify-start">
                <ArrowUpRight className="mr-2 h-4 w-4" /> View Public Website
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button onClick={() => navigateTo('/admin/news/new')} className="justify-start">
                <Plus className="mr-2 h-4 w-4" /> Create News Article
              </Button>
              <Button onClick={() => navigateTo('/admin/achievements/new')} className="justify-start">
                <Plus className="mr-2 h-4 w-4" /> Create Achievement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 