'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { TeacherForm } from '../components/teacher-form';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function CreateTeacherPage() {
  const router = useRouter();

  async function handleCreateTeacher(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...teacherData } = data;
      
      // Add created_at and updated_at fields and id
      const now = new Date().toISOString();
      const finalData = {
        id: uuidv4(),
        ...teacherData,
        created_at: now,
        updated_at: now,
      };
      
      // Insert the teacher
      const { data: insertedData, error } = await supabase
        .from('teachers')
        .insert(finalData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Teacher created successfully',
      });
      
      // Redirect to teachers list
      router.push('/admin/teachers');
      
      // Force a refresh to show the new data
      router.refresh();
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create teacher',
        variant: 'destructive',
      });
      throw error; // Re-throw to be handled by the form
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Teacher</h1>
        <p className="text-muted-foreground">Add a new teacher to the website</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <TeacherForm onSubmit={handleCreateTeacher} />
      </div>
    </div>
  );
} 