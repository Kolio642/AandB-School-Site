'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNews(news.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">News Management</h1>
        <Link
          href="/admin/news/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
        >
          Add News
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {news.map((item) => (
            <li key={item.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-4">
                    <Link
                      href={`/admin/news/${item.id}/edit`}
                      className="text-primary hover:text-primary/80"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {news.length === 0 && (
            <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
              No news items found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
} 