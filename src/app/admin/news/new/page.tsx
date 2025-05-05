'use client';

import { useRouter } from 'next/navigation';
import { NewsForm } from '@/components/admin';
import { supabase } from '@/lib/supabase';

export default function NewNewsPage() {
  const router = useRouter();

  const handleSubmit = async (data: {
    title_en: string;
    title_bg: string;
    summary_en: string;
    summary_bg: string;
    date: string;
    image: string;
    published: boolean;
    content_en?: string;
    content_bg?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('news')
        .insert([data]);

      if (error) throw error;
      
      // Use window.location for hard navigation after successful submission
      window.location.href = '/admin/news';
    } catch (error) {
      console.error('Error creating news:', error);
      alert('Failed to create news item. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create News</h1>
        <p className="text-muted-foreground mt-2">
          Add a new news article to the website
        </p>
      </div>
      
      <NewsForm onSubmit={handleSubmit} />
    </div>
  );
} 