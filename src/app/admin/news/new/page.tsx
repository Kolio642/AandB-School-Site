'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { NewsForm } from '../components/news-form';
import { toast } from '@/components/ui/use-toast';

export default function CreateNewsPage() {
  const router = useRouter();

  async function handleCreateNews(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...newsData } = data;
      
      // Add created_at and updated_at fields
      const now = new Date().toISOString();
      const finalData = {
        ...newsData,
        created_at: now,
        updated_at: now,
      };
      
      // Insert the news item
      const { data: insertedData, error } = await supabase
        .from('news')
        .insert(finalData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'News item created successfully',
      });
      
      // Redirect to news list
      router.push('/admin/news');
      
      // Force a refresh to show the new data
      router.refresh();
    } catch (error: any) {
      console.error('Error creating news:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create news item',
        variant: 'destructive',
      });
      throw error; // Re-throw to be handled by the form
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create News Article</h1>
        <p className="text-muted-foreground">Create a new news article for the website</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <NewsForm onSubmit={handleCreateNews} />
      </div>
    </div>
  );
} 