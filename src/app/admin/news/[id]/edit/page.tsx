'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { NewsForm } from '../../components/news-form';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [newsItem, setNewsItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { id } = params;

  // Fetch the news item data
  useEffect(() => {
    async function fetchNewsItem() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setNewsItem(data);
      } catch (err: any) {
        console.error('Error fetching news item:', err);
        setError(err.message || 'Failed to load news item');
        toast({
          title: 'Error',
          description: err.message || 'Failed to load news item',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchNewsItem();
  }, [id]);

  async function handleUpdateNews(data: any) {
    try {
      // Prepare the data - remove imageFile field which is used only for the front-end
      const { imageFile, ...newsData } = data;
      
      // Add updated_at timestamp
      const updateData = {
        ...newsData,
        updated_at: new Date().toISOString(),
      };
      
      // Update the news item
      const { error } = await supabase
        .from('news')
        .update(updateData)
        .eq('id', id);
        
      if (error) throw error;
      
      // Show success message
      toast({
        title: 'Success',
        description: 'News item updated successfully',
      });
      
      // Redirect to news list
      router.push('/admin/news');
      
      // Force a refresh to show the updated data
      router.refresh();
    } catch (error: any) {
      console.error('Error updating news:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update news item',
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

  if (error || !newsItem) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading News Item</h2>
          <p className="text-muted-foreground mb-4">{error || 'News item not found'}</p>
          <button 
            onClick={() => router.push('/admin/news')}
            className="text-primary hover:underline"
          >
            Return to News List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit News Article</h1>
        <p className="text-muted-foreground">Make changes to the news article</p>
      </div>
      
      <div className="border rounded-lg p-6 bg-card">
        <NewsForm 
          initialData={newsItem} 
          newsId={id} 
          onSubmit={handleUpdateNews} 
        />
      </div>
    </div>
  );
} 