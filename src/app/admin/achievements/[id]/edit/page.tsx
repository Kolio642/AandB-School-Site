'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AchievementForm } from '../../components/achievement-form';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Achievement } from '@/lib/database';
import { use } from 'react';

interface PageParams {
  id: string;
}

export default function EditAchievementPage({ params }: { params: PageParams }) {
  const router = useRouter();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params with React.use()
  const unwrappedParams = use(params as unknown as Promise<PageParams>);
  const id = unwrappedParams.id;

  // Fetch the achievement data
  useEffect(() => {
    async function fetchAchievement() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setAchievement(data);
      } catch (err: any) {
        console.error('Error fetching achievement:', err);
        setError(err.message || 'Failed to load achievement');
        toast({
          title: 'Error',
          description: err.message || 'Failed to load achievement',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchAchievement();
  }, [id]);

  async function handleUpdateAchievement(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...achievementData } = data;
      
      // Add updated_at timestamp
      const updateData = {
        ...achievementData,
        updated_at: new Date().toISOString(),
      };
      
      // Update the achievement item
      const { error } = await supabase
        .from('achievements')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'Achievement updated successfully',
      });
      
      // Redirect to achievements list
      router.push('/admin/achievements');
      
      // Force a refresh to show the updated data
      router.refresh();
    } catch (error: any) {
      console.error('Error updating achievement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update achievement',
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

  if (error || !achievement) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Achievement</h2>
          <p className="text-muted-foreground mb-4">{error || 'Achievement not found'}</p>
          <button 
            onClick={() => router.push('/admin/achievements')}
            className="text-primary hover:underline"
          >
            Return to Achievements List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Achievement</h1>
        <p className="text-muted-foreground">Make changes to the achievement</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <AchievementForm 
          initialData={achievement} 
          achievementId={id} 
          onSubmit={handleUpdateAchievement} 
        />
      </div>
    </div>
  );
} 