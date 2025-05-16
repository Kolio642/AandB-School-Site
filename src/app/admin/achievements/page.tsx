'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Pencil, Trash2, Search, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteImage } from '@/lib/storage-helpers';

interface Achievement {
  id: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  date: string;
  student_name: string | null;
  category: string;
  image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAchievements();
  }, []);

  async function fetchAchievements() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      setIsDeleting(true);
      
      // Find the achievement
      const achievement = achievements.find(item => item.id === id);
      if (!achievement) throw new Error('Achievement not found');
      
      // Delete the image from storage if exists
      if (achievement.image) {
        const deleted = await deleteImage(achievement.image);
        if (deleted) {
          console.log('Successfully deleted image for achievement:', id);
        } else {
          console.warn('Failed to delete image for achievement:', id);
          // Continue with deletion anyway
        }
      }
      
      // Delete the achievement from the database
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAchievements(achievements.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Achievement deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete achievement",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function togglePublishStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAchievements(achievements.map(item => 
        item.id === id ? {...item, published: !currentStatus} : item
      ));
      
      toast({
        title: "Success",
        description: `Achievement ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating publish status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update publish status",
        variant: "destructive",
      });
    }
  }

  // Filter achievements based on search query
  const filteredAchievements = searchQuery.trim() === '' 
    ? achievements 
    : achievements.filter(item => 
        item.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title_bg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description_bg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Manage school achievements and awards</p>
        </div>
        <Button asChild>
          <Link href="/admin/achievements/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Achievement</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Achievements</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search achievements..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchAchievements}
                disabled={isLoading}
              >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            filteredAchievements.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAchievements.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium truncate max-w-[300px]">{item.title_en || item.title_bg}</div>
                          {item.student_name && (
                            <div className="text-sm text-muted-foreground">
                              Student: {item.student_name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.published ? "success" : "secondary"}
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => togglePublishStatus(item.id, item.published)}
                          >
                            {item.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              asChild
                            >
                              <Link href={`/admin/achievements/${item.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Link>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No achievements found</p>
                <Button asChild>
                  <Link href="/admin/achievements/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Achievement
                  </Link>
                </Button>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
} 