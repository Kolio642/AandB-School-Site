'use client';

import { supabase } from '@/lib/supabase';
import NewsForm from '@/components/admin/news-form';

export default function NewNewsPage() {
  const handleSubmit = async (data: { title: string; content: string }) => {
    const { error } = await supabase
      .from('news')
      .insert([data]);

    if (error) throw error;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Create News Item</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new news item to be displayed on the website.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <NewsForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
} 