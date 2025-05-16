'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TeacherForm } from '../../components/teacher-form';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Teacher } from '@/lib/database';
import { use } from 'react';

interface PageParams {
  id: string;
}

export default function EditTeacherPage({ params }: { params: PageParams }) {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params with React.use()
  const unwrappedParams = use(params as unknown as Promise<PageParams>);
  const id = unwrappedParams.id;

  // Fetch the teacher data
  useEffect(() => {
    async function fetchTeacher() {
      try {
        setIsLoading(true);
        console.log('Fetching teacher with ID:', id);
        
        const { data, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setTeacher(data);
      } catch (err: any) {
        console.error('Error fetching teacher:', err);
        setError(err.message || 'Failed to load teacher');
        toast({
          title: 'Error',
          description: err.message || 'Failed to load teacher',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeacher();
  }, [id]);

  async function handleUpdateTeacher(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...teacherData } = data;
      
      // Add updated_at timestamp
      const updateData = {
        ...teacherData,
        updated_at: new Date().toISOString(),
      };
      
      // Update the teacher
      const { error } = await supabase
        .from('teachers')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Teacher updated successfully',
      });
      
      // Redirect to teachers list
      router.push('/admin/teachers');
      
      // Force a refresh to show the updated data
      router.refresh();
    } catch (error: any) {
      console.error('Error updating teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update teacher',
        variant: 'destructive',
      });
      throw error; // Re-throw to be handled by the form
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Teacher</h2>
          <p className="text-muted-foreground mb-4">{error || 'Teacher not found'}</p>
          <button 
            onClick={() => router.push('/admin/teachers')}
            className="text-primary hover:underline"
          >
            Return to Teachers List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Teacher</h1>
        <p className="text-muted-foreground">Make changes to the teacher profile</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <TeacherForm 
          initialData={teacher} 
          teacherId={id} 
          onSubmit={handleUpdateTeacher} 
        />
      </div>
    </div>
  );
} 