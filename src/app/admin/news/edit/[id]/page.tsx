'use client';

import { NewsForm } from '@/components/admin/news-form';

interface EditNewsPageProps {
  params: {
    id: string;
  };
}

export default function EditNewsPage({ params }: EditNewsPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit News</h1>
        <p className="text-muted-foreground mt-2">
          Make changes to an existing news article
        </p>
      </div>
      
      <NewsForm newsId={params.id} />
    </div>
  );
} 