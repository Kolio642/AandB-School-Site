'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { NewsForm } from '@/components/admin';

interface NewsItem {
  id: string;
  title_en: string;
  title_bg: string;
  summary_en: string;
  summary_bg: string;
  content_en: string;
  content_bg: string;
  date: string;
  image: string;
  published: boolean;
}

export default function EditNewsPage({ params }: { params: { id: string } }) {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [params.id]);

  async function fetchNews() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  }

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
    const { error } = await supabase
      .from('news')
      .update(data)
      .eq('id', params.id);

    if (error) throw error;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">News item not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The news item you're looking for doesn't exist or has been deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Edit News Item</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the news item details below.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <NewsForm initialData={news} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
} 