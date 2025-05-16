'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Pencil, Trash2, Search, RefreshCcw, Users } from 'lucide-react';
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

interface Teacher {
  id: string;
  name: string;
  title_en: string;
  title_bg: string;
  bio_en: string;
  bio_bg: string;
  email: string;
  image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  sort_order: number;
}

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      setIsDeleting(true);
      
      // Find the teacher
      const teacher = teachers.find(item => item.id === id);
      if (!teacher) throw new Error('Teacher not found');
      
      // Delete the image from storage if exists
      if (teacher.image) {
        const deleted = await deleteImage(teacher.image);
        if (deleted) {
          console.log('Successfully deleted image for teacher:', id);
        } else {
          console.warn('Failed to delete image for teacher:', id);
          // Continue with deletion anyway
        }
      }
      
      // Delete the teacher from the database
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setTeachers(teachers.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function togglePublishStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setTeachers(teachers.map(item => 
        item.id === id ? {...item, published: !currentStatus} : item
      ));
      
      toast({
        title: "Success",
        description: `Teacher ${!currentStatus ? 'published' : 'unpublished'} successfully`,
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

  // Filter teachers based on search query
  const filteredTeachers = searchQuery.trim() === '' 
    ? teachers 
    : teachers.filter(item => 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title_bg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bio_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bio_bg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage school teaching staff</p>
        </div>
        <Button asChild>
          <Link href="/admin/teachers/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Teacher</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Teachers</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search teachers..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchTeachers}
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
            filteredTeachers.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium flex items-center gap-3">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <Users className="h-4 w-4" />
                              </div>
                            )}
                            {item.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{item.title_en || item.title_bg}</div>
                            {item.title_en !== item.title_bg && (
                              <div className="text-xs text-muted-foreground">{item.title_bg}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.email || "N/A"}</TableCell>
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
                              <Link href={`/admin/teachers/${item.id}/edit`}>
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
                <p className="text-muted-foreground mb-4">No teachers found</p>
                <Button asChild>
                  <Link href="/admin/teachers/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Teacher
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