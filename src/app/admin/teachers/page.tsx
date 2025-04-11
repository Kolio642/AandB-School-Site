'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

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
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .order('sort_order', { ascending: true });

        if (error) throw error;

        setTeachers(data || []);
      } catch (error: any) {
        console.error('Error fetching teachers:', error);
        setError(error.message || 'Failed to load teachers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTeachers(teachers.filter(teacher => teacher.id !== id));
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      alert(`Error deleting teacher: ${error.message}`);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <Button asChild>
          <Link href="/admin/teachers/new">
            <Plus className="mr-2 h-4 w-4" /> Add Teacher
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>
            Manage teacher profiles for the school website.
          </CardDescription>
        </CardHeader>
        <CardContent>
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