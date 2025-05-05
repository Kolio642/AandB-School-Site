'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/admin';
import { supabase } from '@/lib/supabase';
import { BarChart, BookOpen, FileText, Plus, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface DashboardStats {
  newsCount: number;
  achievementsCount: number;
  teachersCount: number;
  coursesCount: number;
  publishedNewsCount: number;
  publishedAchievementsCount: number;
  lastUpdateTime: string | null;
}

interface ActivityItem {
  id: string;
  type: 'news' | 'achievement' | 'teacher' | 'course';
  title: string;
  action: 'created' | 'updated' | 'published';
  timestamp: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    newsCount: 0,
    achievementsCount: 0,
    teachersCount: 0,
    coursesCount: 0,
    publishedNewsCount: 0,
    publishedAchievementsCount: 0,
    lastUpdateTime: null,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch counts in parallel
        const [
          { count: newsCount, data: newsData }, 
          { count: achievementsCount, data: achievementsData },
          { count: publishedNewsCount },
          { count: publishedAchievementsCount },
          { count: teachersCount, data: teachersData },
          { count: coursesCount, data: coursesData },
        ] = await Promise.all([
          supabase.from('news').select('*', { count: 'exact' }).limit(5).order('created_at', { ascending: false }),
          supabase.from('achievements').select('*', { count: 'exact' }).limit(5).order('created_at', { ascending: false }),
          supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('teachers').select('*', { count: 'exact' }).limit(3).order('created_at', { ascending: false }),
          supabase.from('courses').select('*', { count: 'exact' }).limit(3).order('created_at', { ascending: false }),
        ]);

        // Get the last update time
        const allItems = [
          ...(newsData || []).map(item => ({ ...item, type: 'news' })),
          ...(achievementsData || []).map(item => ({ ...item, type: 'achievement' })),
          ...(teachersData || []).map(item => ({ ...item, type: 'teacher' })),
          ...(coursesData || []).map(item => ({ ...item, type: 'course' })),
        ];
        
        const sortedItems = allItems.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        const lastUpdate = sortedItems.length > 0 ? sortedItems[0].created_at : null;
        
        // Create recent activity data
        const activityItems: ActivityItem[] = sortedItems.slice(0, 10).map(item => {
          let title = '';
          let action: 'created' | 'updated' | 'published' = 'created';
          
          if (item.type === 'news') {
            title = item.title_en || item.title_bg || 'Unnamed news';
            action = item.published ? 'published' : 'created';
          } else if (item.type === 'achievement') {
            title = item.title_en || item.title_bg || 'Unnamed achievement';
            action = item.published ? 'published' : 'created';
          } else if (item.type === 'teacher') {
            title = `${item.first_name} ${item.last_name}` || 'Unnamed teacher';
          } else if (item.type === 'course') {
            title = item.name_en || item.name_bg || 'Unnamed course';
          }
          
          return {
            id: item.id,
            type: item.type as any,
            title,
            action,
            timestamp: item.created_at,
          };
        });

        setStats({
          newsCount: newsCount || 0,
          achievementsCount: achievementsCount || 0,
          teachersCount: teachersCount || 0,
          coursesCount: coursesCount || 0,
          publishedNewsCount: publishedNewsCount || 0,
          publishedAchievementsCount: publishedAchievementsCount || 0,
          lastUpdateTime: lastUpdate,
        });
        
        setRecentActivity(activityItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Quick action links
  const quickActions = [
    { 
      label: 'Add News', 
      href: '/admin/news/new', 
      icon: <FileText className="w-4 h-4 mr-2" />,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      label: 'Add Achievement', 
      href: '/admin/achievements/new', 
      icon: <Trophy className="w-4 h-4 mr-2" />,
      color: 'bg-emerald-500 hover:bg-emerald-600'
    },
    { 
      label: 'Add Teacher', 
      href: '/admin/teachers/new', 
      icon: <Users className="w-4 h-4 mr-2" />,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    { 
      label: 'Add Course', 
      href: '/admin/courses/new', 
      icon: <BookOpen className="w-4 h-4 mr-2" />,
      color: 'bg-amber-500 hover:bg-amber-600'
    },
  ];

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (e) {
      return 'some time ago';
    }
  };

  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'news': return <FileText className="w-4 h-4" />;
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'teacher': return <Users className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get color for activity type
  const getActivityColor = (type: string) => {
    switch(type) {
      case 'news': return 'bg-blue-100 text-blue-800';
      case 'achievement': return 'bg-emerald-100 text-emerald-800';
      case 'teacher': return 'bg-purple-100 text-purple-800';
      case 'course': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-600">
          Manage your school content and view performance statistics
          {stats.lastUpdateTime && (
            <span className="text-sm ml-2">
              • Last updated {formatTime(stats.lastUpdateTime)}
            </span>
          )}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick actions */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`${action.color} text-white py-3 px-4 rounded-lg flex items-center justify-center shadow-sm transition-transform hover:scale-105`}
                >
                  {action.icon}
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Stats grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Content Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">News Articles</p>
                    <h3 className="text-2xl font-bold text-blue-700">{stats.newsCount}</h3>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-md">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-blue-700">
                    <span className="font-medium">{stats.publishedNewsCount}</span> published
                  </div>
                  <Link href="/admin/news" className="text-xs font-medium text-blue-600 hover:text-blue-800">
                    View all →
                  </Link>
                </div>
              </div>
              
              <div className="bg-emerald-50 p-5 rounded-lg border border-emerald-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600 mb-1">Achievements</p>
                    <h3 className="text-2xl font-bold text-emerald-700">{stats.achievementsCount}</h3>
                  </div>
                  <div className="p-2 bg-emerald-100 rounded-md">
                    <Trophy className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-emerald-700">
                    <span className="font-medium">{stats.publishedAchievementsCount}</span> published
                  </div>
                  <Link href="/admin/achievements" className="text-xs font-medium text-emerald-600 hover:text-emerald-800">
                    View all →
                  </Link>
                </div>
              </div>
              
              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Teachers</p>
                    <h3 className="text-2xl font-bold text-purple-700">{stats.teachersCount}</h3>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-md">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-purple-700">
                    <span className="font-medium">Faculty members</span>
                  </div>
                  <Link href="/admin/teachers" className="text-xs font-medium text-purple-600 hover:text-purple-800">
                    View all →
                  </Link>
                </div>
              </div>
              
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 mb-1">Courses</p>
                    <h3 className="text-2xl font-bold text-amber-700">{stats.coursesCount}</h3>
                  </div>
                  <div className="p-2 bg-amber-100 rounded-md">
                    <BookOpen className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-amber-700">
                    <span className="font-medium">Educational programs</span>
                  </div>
                  <Link href="/admin/courses" className="text-xs font-medium text-amber-600 hover:text-amber-800">
                    View all →
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent activity */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
            <div className="bg-white border rounded-lg overflow-hidden">
              {recentActivity.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <li key={`${activity.type}-${activity.id}`} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-md ${getActivityColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                              {activity.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activity.action === 'created' ? 'Added new' : activity.action === 'published' ? 'Published' : 'Updated'} {activity.type}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatTime(activity.timestamp)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-500 mb-4">No recent activity found</p>
                  <Button asChild variant="outline">
                    <Link href="/admin/news/new">
                      Create your first content
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 