'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AchievementForm } from '../../components/achievement-form';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface EditAchievementPageProps {
  params: {
    id: string;
  };
}

export default function EditAchievementPage({ params }: EditAchievementPageProps) {
  const { id } = params;
  const router = useRouter();
  
  const [achievement, setAchievement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (!data) {
          setError('Achievement not found');
          return;
        }
        
        setAchievement(data);
      } catch (err: any) {
        console.error('Error fetching achievement:', err);
        setError(err.message || 'Failed to load achievement');
        
        toast({
          title: "Error",
          description: err.message || "Failed to load achievement",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAchievement();
  }, [id]);

  const handleSubmit = async (formData: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Remove any fields that shouldn't be sent to the API
      const { imageFile, ...dataToSend } = formData;
      
      // Update the achievement
      const { data, error } = await supabase
        .from('achievements')
        .update(dataToSend)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Achievement updated successfully",
      });
      
      // Navigate back to achievements listing
      router.push('/admin/achievements');
      
    } catch (error: any) {
      console.error('Error updating achievement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update achievement",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading achievement...</p>
      </div>
    );
  }

  if (error || !achievement) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button asChild variant="ghost" className="mr-2">
            <Link href="/admin/achievements">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Achievements
            </Link>
          </Button>
        </div>
        
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <h3 className="font-medium">Error</h3>
          <p>{error || 'Achievement not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Edit Achievement</h1>
          <p className="text-muted-foreground">Update achievement details</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/achievements">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Achievements
          </Link>
        </Button>
      </div>
      
      <div className="border-t pt-6">
        <AchievementForm 
          initialData={achievement} 
          achievementId={id} 
          onSubmit={handleSubmit} 
        />
      </div>
    </div>
  );
} 