'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AchievementForm } from '../components/achievement-form';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export default function CreateAchievementPage() {
  const router = useRouter();

  async function handleCreateAchievement(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...achievementData } = data;
      
      // Add created_at and updated_at fields and id
      const now = new Date().toISOString();
      const finalData = {
        id: uuidv4(),
        ...achievementData,
        created_at: now,
        updated_at: now,
      };
      
      // Insert the achievement item
      const { data: insertedData, error } = await supabase
        .from('achievements')
        .insert(finalData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Achievement created successfully',
      });
      
      // Redirect to achievements list
      router.push('/admin/achievements');
      
      // Force a refresh to show the new data
      router.refresh();
    } catch (error: any) {
      console.error('Error creating achievement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create achievement',
        variant: 'destructive',
      });
      throw error; // Re-throw to be handled by the form
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Achievement</h1>
        <p className="text-muted-foreground">Create a new achievement for the website</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <AchievementForm onSubmit={handleCreateAchievement} />
      </div>
    </div>
  );
} 