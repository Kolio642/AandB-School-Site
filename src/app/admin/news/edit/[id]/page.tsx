'use client';

import { useRouter } from 'next/navigation';
import { NewsForm } from '@/components/admin';
import { supabase } from '@/lib/supabase';

interface EditNewsPageProps {
  params: {
    id: string;
  };
}

export default function EditNewsPage({ params }: EditNewsPageProps) {
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
    const { error } = await supabase
      .from('news')
      .update(data)
      .eq('id', params.id);

    if (error) throw error;
    
    router.push('/admin/news');
    router.refresh();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit News</h1>
        <p className="text-muted-foreground mt-2">
          Make changes to an existing news article
        </p>
      </div>
      
      <NewsForm newsId={params.id} onSubmit={handleSubmit} />
    </div>
  );
} 