'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CourseForm } from '../../components/course-form';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Course } from '@/lib/database';
import { use } from 'react';

interface PageParams {
  id: string;
}

export default function EditCoursePage({ params }: { params: PageParams }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params with React.use()
  const unwrappedParams = use(params as unknown as Promise<PageParams>);
  const id = unwrappedParams.id;

  // Fetch the course data
  useEffect(() => {
    async function fetchCourse() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setCourse(data);
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to load course');
        toast({
          title: 'Error',
          description: err.message || 'Failed to load course',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [id]);

  async function handleUpdateCourse(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...courseData } = data;
      
      // Add updated_at timestamp
      const updateData = {
        ...courseData,
        updated_at: new Date().toISOString(),
      };
      
      // Update the course
      const { error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
      
      // Redirect to courses list
      router.push('/admin/courses');
      
      // Force a refresh to show the updated data
      router.refresh();
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update course',
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

  if (error || !course) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Course</h2>
          <p className="text-muted-foreground mb-4">{error || 'Course not found'}</p>
          <button 
            onClick={() => router.push('/admin/courses')}
            className="text-primary hover:underline"
          >
            Return to Courses List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground">Make changes to the course</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <CourseForm 
          initialData={course} 
          courseId={id} 
          onSubmit={handleUpdateCourse} 
        />
      </div>
    </div>
  );
} 