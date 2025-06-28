'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AchievementForm } from '../components/achievement-form';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

export default function NewAchievementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Remove any fields that shouldn't be sent to the API
      const { imageFile, ...dataToSend } = formData;
      
      // Insert the new achievement
      const { data, error } = await supabase
        .from('achievements')
        .insert([dataToSend])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Achievement created successfully",
      });
      
      // Navigate back to achievements listing
      router.push('/admin/achievements');
      
    } catch (error: any) {
      console.error('Error creating achievement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create achievement",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Create New Achievement</h1>
        <p className="text-muted-foreground">
          Add a new achievement to showcase on the website
        </p>
      </div>
      
      <div className="border-t pt-6">
        <AchievementForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
} 