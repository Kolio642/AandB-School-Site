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

const categoryOptions = [
  'Math Competition',
  'Informatics Competition',
  'Science Olympiad',
  'Art Competition',
  'Sports Achievement',
  'School Award',
  'Other'
];

const achievementSchema = z.object({
  title_en: z.string().min(1, { message: 'English title is required' }),
  title_bg: z.string().min(1, { message: 'Bulgarian title is required' }),
  student_name: z.string().optional(),
  category: z.string().min(1, { message: 'Category is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  image: z.string().optional(),
  published: z.boolean().default(false),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

interface AchievementFormProps {
  achievementId?: string;
}

export function AchievementForm({ achievementId }: AchievementFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(!!achievementId);
  const [description_en, setDescription_en] = useState('');
  const [description_bg, setDescription_bg] = useState('');

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title_en: '',
      title_bg: '',
      student_name: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      image: '',
      published: false,
    },
  });

  useEffect(() => {
    const fetchAchievement = async () => {
      if (!achievementId) return;

      try {
        setIsLoadingData(true);
        setError(null);

        const { data, error } = await supabase
          .from('achievements')
          .select('*')
          .eq('id', achievementId)
          .single();

        if (error) throw error;

        if (data) {
          form.reset({
            title_en: data.title_en || '',
            title_bg: data.title_bg || '',
            student_name: data.student_name || '',
            category: data.category || '',
            date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
            image: data.image || '',
            published: data.published || false,
          });

          setDescription_en(data.description_en || '');
          setDescription_bg(data.description_bg || '');
        }
      } catch (error: any) {
        console.error('Error fetching achievement:', error);
        setError(error.message || 'Failed to load achievement');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAchievement();
  }, [achievementId, form]);

  async function onSubmit(data: AchievementFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const achievementData = {
        ...data,
        description_en,
        description_bg,
        updated_at: new Date().toISOString(),
      };

      let response;

      if (achievementId) {
        // Update existing achievement
        response = await supabase
          .from('achievements')
          .update(achievementData)
          .eq('id', achievementId);
      } else {
        // Create new achievement
        response = await supabase
          .from('achievements')
          .insert([achievementData]);
      }

      if (response.error) throw response.error;

      router.push('/admin/achievements');
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'Failed to save achievement');
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading Achievement...</div>
          <div className="text-muted-foreground">Please wait while we fetch the achievement data.</div>
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
            <Label>English Description</Label>
            <div className="mt-1">
              <ReactQuill 
                theme="snow" 
                value={description_en} 
                onChange={setDescription_en}
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
            <Label>Bulgarian Description</Label>
            <div className="mt-1">
              <ReactQuill 
                theme="snow" 
                value={description_bg} 
                onChange={setDescription_bg}
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
              <Label htmlFor="student_name">Student Name (optional)</Label>
              <Input
                id="student_name"
                {...form.register('student_name')}
                placeholder="Enter student name if applicable"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                {...form.register('category')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mt-4">
            <div>
              <Label htmlFor="date">Achievement Date</Label>
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
              <Label htmlFor="image">Image URL (optional)</Label>
              <Input
                id="image"
                type="text"
                placeholder="https://example.com/image.jpg"
                {...form.register('image')}
              />
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
          onClick={() => router.push('/admin/achievements')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : achievementId ? 'Update Achievement' : 'Create Achievement'}
        </Button>
      </div>
    </form>
  );
} 