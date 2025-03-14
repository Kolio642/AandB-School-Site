'use client';

import { NewsForm } from '@/components/admin/news-form';

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create News</h1>
        <p className="text-muted-foreground mt-2">
          Add a new news article to the website
        </p>
      </div>
      
      <NewsForm />
    </div>
  );
} 