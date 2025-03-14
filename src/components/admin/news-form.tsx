'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Dynamically import React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const newsSchema = z.object({
  title_en: z.string().min(1, { message: 'English title is required' }),
  title_bg: z.string().min(1, { message: 'Bulgarian title is required' }),
  summary_en: z.string().min(1, { message: 'English summary is required' }),
  summary_bg: z.string().min(1, { message: 'Bulgarian summary is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  image: z.string().min(1, { message: 'Image URL is required' }),
  published: z.boolean().default(false),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  newsId?: string;
}

export function NewsForm({ newsId }: NewsFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!newsId);
  const [content_en, setContent_en] = useState('');
  const [content_bg, setContent_bg] = useState('');

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title_en: '',
      title_bg: '',
      summary_en: '',
      summary_bg: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      published: false,
    },
  });

  useEffect(() => {
    const fetchNewsItem = async () => {
      if (!newsId) return;

      try {
        setIsLoadingData(true);
        setError(null);

        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('id', newsId)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            title_en: data.title_en || '',
            title_bg: data.title_bg || '',
            summary_en: data.summary_en || '',
            summary_bg: data.summary_bg || '',
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
            image: data.image || '',
            published: data.published || false,
          });

          setContent_en(data.content_en || '');
          setContent_bg(data.content_bg || '');
        }
      } catch (error: any) {
        console.error('Error fetching news item:', error);
        setError(error.message || 'Failed to load news item');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchNewsItem();
  }, [newsId, form]);

  async function onSubmit(data: NewsFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const newsData = {
        ...data,
        content_en,
        content_bg,
        updated_at: new Date().toISOString(),
      };

      let response;

      if (newsId) {
        // Update existing news
        response = await supabase
          .from('news')
          .update(newsData)
          .eq('id', newsId);
      } else {
        // Create new news
        response = await supabase
          .from('news')
          .insert([newsData]);
      }

      if (response.error) throw response.error;

      router.push('/admin/news');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to save news item');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading News Item...</div>
          <div className="text-muted-foreground">Please wait while we fetch the news data.</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title_en">English Title</Label>
            <Input
              id="title_en"
              {...form.register('title_en')}
            />
            {form.formState.errors.title_en && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title_en.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="summary_en">English Summary</Label>
            <textarea
              id="summary_en"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register('summary_en')}
            />
            {form.formState.errors.summary_en && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.summary_en.message}</p>
            )}
          </div>

          <div>
            <Label>English Content</Label>
            <div className="mt-1">
              <ReactQuill 
                theme="snow" 
                value={content_en} 
                onChange={setContent_en}
                className="min-h-[200px]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title_bg">Bulgarian Title</Label>
            <Input
              id="title_bg"
              {...form.register('title_bg')}
            />
            {form.formState.errors.title_bg && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title_bg.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="summary_bg">Bulgarian Summary</Label>
            <textarea
              id="summary_bg"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register('summary_bg')}
            />
            {form.formState.errors.summary_bg && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.summary_bg.message}</p>
            )}
          </div>

          <div>
            <Label>Bulgarian Content</Label>
            <div className="mt-1">
              <ReactQuill 
                theme="snow" 
                value={content_bg} 
                onChange={setContent_bg}
                className="min-h-[200px]"
              />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="date">Publication Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register('date')}
              />
              {form.formState.errors.date && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="text"
                placeholder="https://example.com/image.jpg"
                {...form.register('image')}
              />
              {form.formState.errors.image && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.image.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <input
              id="published"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...form.register('published')}
            />
            <Label htmlFor="published" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Publish immediately
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/admin/news')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : newsId ? 'Update News' : 'Create News'}
        </Button>
      </div>
    </form>
  );
} 