'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { CourseForm } from '../components/course-form';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function CreateCoursePage() {
  const router = useRouter();

  async function handleCreateCourse(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...courseData } = data;
      
      // Add created_at and updated_at fields and id
      const now = new Date().toISOString();
      const finalData = {
        id: uuidv4(),
        ...courseData,
        created_at: now,
        updated_at: now,
      };
      
      // Insert the course
      const { data: insertedData, error } = await supabase
        .from('courses')
        .insert(finalData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Course created successfully',
      });
      
      // Redirect to courses list
      router.push('/admin/courses');
      
      // Force a refresh to show the new data
      router.refresh();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create course',
        variant: 'destructive',
      });
      throw error; // Re-throw to be handled by the form
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Course</h1>
        <p className="text-muted-foreground">Add a new course to the website</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <CourseForm onSubmit={handleCreateCourse} />
      </div>
    </div>
  );
} 