'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Newspaper, 
  Award, 
  Users, 
  PlusCircle, 
  ArrowRight,
  Calendar,
  Activity,
  Settings
} from 'lucide-react';

interface DashboardStats {
  newsCount: number;
  achievementsCount: number;
  teachersCount: number;
  publishedNewsCount?: number;
  publishedAchievementsCount?: number;
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentActivity, setRecentActivity] = useState<Array<{id: string, type: string, title: string, date: string}>>([]);

  useEffect(() => {
    // Check if user is authenticated
    if (!isLoading && !user) {
      console.log('User not authenticated, redirecting to login...');
      router.push('/admin');
    } else if (user) {
      fetchDashboardStats();
      fetchRecentActivity();
    }
  }, [user, isLoading, router]);

  async function fetchDashboardStats() {
    setIsLoadingStats(true);
    try {
      // Fetch news count
      const { count: newsCount, error: newsError } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true });

      // Fetch published news count
      const { count: publishedNewsCount, error: publishedNewsError } = await supabase
        .from('news')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Fetch achievements count
      const { count: achievementsCount, error: achievementsError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });
        
      // Fetch published achievements count
      const { count: publishedAchievementsCount, error: publishedAchievementsError } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

      // Fetch teachers count
      const { count: teachersCount, error: teachersError } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true });

      if (newsError || achievementsError || teachersError) {
        console.error('Error fetching dashboard stats:', {
          newsError,
          achievementsError,
          teachersError
        });
        return;
      }

      setStats({
        newsCount: newsCount || 0,
        achievementsCount: achievementsCount || 0,
        teachersCount: teachersCount || 0,
        publishedNewsCount: publishedNewsCount || 0,
        publishedAchievementsCount: publishedAchievementsCount || 0
      });
    } catch (error) {
      console.error('Unexpected error fetching dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }
  
  async function fetchRecentActivity() {
    try {
      // Fetch the 5 most recent news items
      const { data: recentNews, error: newsError } = await supabase
        .from('news')
        .select('id, title_en, created_at')
        .order('created_at', { ascending: false })
        .limit(3);
        
      // Fetch the 5 most recent achievements
      const { data: recentAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('id, title_en, created_at')
        .order('created_at', { ascending: false })
        .limit(2);
        
      if (newsError || achievementsError) {
        console.error('Error fetching recent activity:', {
          newsError,
          achievementsError
        });
        return;
      }
      
      // Combine and sort the results
      const activity = [
        ...(recentNews || []).map(item => ({
          id: item.id,
          type: 'news',
          title: item.title_en,
          date: item.created_at
        })),
        ...(recentAchievements || []).map(item => ({
          id: item.id,
          type: 'achievement',
          title: item.title_en,
          date: item.created_at
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Unexpected error fetching recent activity:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Card icons mapping
  const statCards = [
    {
      title: "News Articles",
      value: stats?.newsCount || 0,
      description: `${stats?.publishedNewsCount || 0} published`,
      icon: <Newspaper className="h-4 w-4" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      link: "/admin/news",
      linkText: "Manage News"
    },
    {
      title: "Achievements",
      value: stats?.achievementsCount || 0,
      description: `${stats?.publishedAchievementsCount || 0} published`,
      icon: <Award className="h-4 w-4" />,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      link: "/admin/achievements",
      linkText: "Manage Achievements"
    },
    {
      title: "Teachers",
      value: stats?.teachersCount || 0,
      icon: <Users className="h-4 w-4" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      link: "/admin/teachers",
      linkText: "Manage Teachers"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back to the A&B School admin panel.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button asChild className="gap-2">
            <Link href="/admin/news/new">
              <PlusCircle className="h-4 w-4" /> New Article
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/bg">
              <ArrowRight className="h-4 w-4" /> View Website
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, i) => (
          <Card key={i} className="overflow-hidden border-l-4" style={{borderLeftColor: card.color.replace('text-', 'var(--')}}>
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`rounded-full ${card.bgColor} ${card.color} p-2`}>
                {card.icon}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {isLoadingStats ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  {card.description && (
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  )}
                  <div className="mt-3">
                    <Link 
                      href={card.link} 
                      className={`text-xs ${card.color} font-medium hover:underline flex items-center gap-1`}
                    >
                      {card.linkText} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Latest content updates</CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            {recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map((item) => (
                  <li key={item.id} className="flex items-start gap-4">
                    <div className={`mt-0.5 rounded-full p-1.5 ${
                      item.type === 'news' 
                        ? 'bg-blue-50 text-blue-500' 
                        : 'bg-yellow-50 text-yellow-500'
                    }`}>
                      {item.type === 'news' ? (
                        <Newspaper className="h-3.5 w-3.5" />
                      ) : (
                        <Award className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(item.date)}
                        <span className="mx-1">•</span>
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">No recent activity found.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="pb-1">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Button asChild className="h-20 flex flex-col items-center justify-center gap-1" variant="outline">
                  <Link href="/admin/news/new">
                    <Newspaper className="h-5 w-5 mb-1" />
                    <span className="text-xs">Add News</span>
                  </Link>
                </Button>
                <Button asChild className="h-20 flex flex-col items-center justify-center gap-1" variant="outline">
                  <Link href="/admin/achievements/new">
                    <Award className="h-5 w-5 mb-1" />
                    <span className="text-xs">Add Achievement</span>
                  </Link>
                </Button>
                <Button asChild className="h-20 flex flex-col items-center justify-center gap-1" variant="outline">
                  <Link href="/admin/teachers/new">
                    <Users className="h-5 w-5 mb-1" />
                    <span className="text-xs">Add Teacher</span>
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <Button asChild className="h-12" variant="secondary">
                  <Link href="/admin/news" className="flex items-center justify-center gap-2">
                    <Newspaper className="h-4 w-4" />
                    <span>All News</span>
                  </Link>
                </Button>
                <Button asChild className="h-12" variant="secondary">
                  <Link href="/admin/achievements" className="flex items-center justify-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>All Achievements</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 