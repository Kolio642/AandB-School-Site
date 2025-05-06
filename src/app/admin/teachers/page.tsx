'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, RefreshCcw } from 'lucide-react';

interface Teacher {
  id: string;
  created_at: string;
  name: string;
  title_en: string;
  title_bg: string;
  email: string | null;
  published: boolean;
  sort_order: number;
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Used to keep track of navigation events
  const lastRefreshTime = useRef(Date.now());
  const forceUpdateRef = useRef(0);

  const fetchTeachers = async (forceRefresh = false) => {
      try {
      if (!forceRefresh && Date.now() - lastRefreshTime.current < 1000) {
        // Skip if we refreshed less than 1 second ago, unless force refresh
        console.log('Skipping redundant fetch, refreshed recently');
        return;
      }
      
        setIsLoading(true);
        setError(null);

      console.log('Fetching teachers data...', forceUpdateRef.current);
      
      // First check auth session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current auth session:', session ? 'Active' : 'None');
      
      // Use the appropriate client
      const client = session ? supabase : supabaseAdmin;
      console.log('Using client:', session ? 'User client' : 'Admin client');
      
      // Use the cache breaker parameter to force a fresh fetch
      const { data, error } = await client
          .from('teachers')
          .select('*')
        .order('created_at', { ascending: false }) // Show newest first instead of by sort_order
        .limit(20);  // Limit to a reasonable number to avoid performance issues

      if (error) {
        console.error('Database error during fetch:', error);
        throw error;
      }

      console.log('Teachers data received:', data?.length || 0, 'records');
      // Force a re-render by creating a new array
      setTeachers(data ? [...data] : []);
      lastRefreshTime.current = Date.now();
      } catch (error: any) {
        console.error('Error fetching teachers:', error);
        setError(error.message || 'Failed to load teachers');
      } finally {
        setIsLoading(false);
      }
    };

  // Fetch on initial load
  useEffect(() => {
    fetchTeachers(true);
  }, []);

  // Force refresh when switching to this page
  useEffect(() => {
    if (pathname === '/admin/teachers') {
      console.log('Teachers page is active, refreshing data');
      forceUpdateRef.current++; // Increment to force a refresh
      fetchTeachers(true); // Force refresh
    }
  }, [pathname]);

  // Refresh data when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (pathname === '/admin/teachers') {
        console.log('Window focused on teachers page, refreshing data');
        forceUpdateRef.current++; // Increment to force a refresh
        fetchTeachers(true); // Force refresh
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && pathname === '/admin/teachers') {
        console.log('Page became visible, refreshing data');
        forceUpdateRef.current++; // Increment to force a refresh
        fetchTeachers(true); // Force refresh
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      console.log('Deleting teacher with ID:', id);
      
      // Use direct fetch with service role key
      const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/teachers?id=eq.${id}`,
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
      console.log('Teacher deleted successfully');

      // Update local state immediately
      setTeachers(prevTeachers => prevTeachers.filter(teacher => teacher.id !== id));
      
      // Refresh data from server after a short delay
      setTimeout(() => {
        fetchTeachers(true);
      }, 500);
      
      // Show success message
      alert('Teacher deleted successfully');
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      // More detailed error information
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
      if (error.details) {
        console.error(`Error details: ${error.details}`);
      }
      alert(`Error deleting teacher: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTeachers(teachers.map(teacher => 
        teacher.id === id ? { ...teacher, published: !currentStatus } : teacher
      ));
    } catch (error: any) {
      console.error('Error updating teacher status:', error);
      alert(`Error updating teacher status: ${error.message}`);
    }
  };

  const handleRefresh = () => {
    forceUpdateRef.current++; // Increment to force a refresh
    fetchTeachers(true); // Force refresh
  };

  if (isLoading && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <div className="text-sm text-muted-foreground">Loading teachers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh} size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>
        <Button asChild>
          <Link href="/admin/teachers/new">
            <Plus className="mr-2 h-4 w-4" /> Add Teacher
          </Link>
        </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>
            Manage teacher profiles for the school website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && teachers.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          
          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No teachers found</p>
              <Button asChild variant="outline">
                <Link href="/admin/teachers/new">Add Your First Teacher</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title (EN)</TableHead>
                  <TableHead>Title (BG)</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.title_en}</TableCell>
                    <TableCell>{teacher.title_bg}</TableCell>
                    <TableCell>{teacher.email || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={teacher.published ? "default" : "secondary"}>
                        {teacher.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/teachers/edit/${teacher.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublished(teacher.id, teacher.published)}
                        >
                          {teacher.published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(teacher.id)}
                          className="text-destructive hover:text-destructive/90"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 