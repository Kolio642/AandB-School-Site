'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Form validation schema
const courseSchema = z.object({
  title_en: z.string().min(1, 'English title is required'),
  title_bg: z.string().min(1, 'Bulgarian title is required'),
  description_en: z.string().min(1, 'English description is required'),
  description_bg: z.string().min(1, 'Bulgarian description is required'),
  content_en: z.string().optional(),
  content_bg: z.string().optional(),
  image: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  published: z.boolean().default(false),
  sort_order: z.number().default(0),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function NewCoursePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title_en: '',
      title_bg: '',
      description_en: '',
      description_bg: '',
      content_en: '',
      content_bg: '',
      image: '/images/courses/placeholder.jpg',
      category: 'Art',
      published: false,
      sort_order: 0,
    },
  });

  async function onSubmit(data: CourseFormValues) {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('courses')
        .insert({
          title_en: data.title_en,
          title_bg: data.title_bg,
          description_en: data.description_en,
          description_bg: data.description_bg,
          content_en: data.content_en || null,
          content_bg: data.content_bg || null,
          image: data.image || null,
          category: data.category,
          published: data.published,
          sort_order: data.sort_order,
        });
      
      if (error) throw error;
      
      router.push('/admin/courses');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating course:', error);
      alert(`Error creating course: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Course</h1>
        <p className="text-muted-foreground mt-2">
          Create a new course or program for the website.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Enter the basic information for the course.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="english" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="bulgarian">Bulgarian</TabsTrigger>
              </TabsList>
              
              <TabsContent value="english" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title_en">Title (English)</Label>
                  <Input
                    id="title_en"
                    {...form.register('title_en')}
                    placeholder="Introduction to Art"
                  />
                  {form.formState.errors.title_en && (
                    <p className="text-sm text-destructive">{form.formState.errors.title_en.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    {...form.register('description_en')}
                    placeholder="A brief description of the course..."
                    rows={3}
                  />
                  {form.formState.errors.description_en && (
                    <p className="text-sm text-destructive">{form.formState.errors.description_en.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_en">Detailed Content (English)</Label>
                  <Textarea
                    id="content_en"
                    {...form.register('content_en')}
                    placeholder="Full details about the course..."
                    rows={6}
                  />
                  {form.formState.errors.content_en && (
                    <p className="text-sm text-destructive">{form.formState.errors.content_en.message}</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="bulgarian" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title_bg">Title (Bulgarian)</Label>
                  <Input
                    id="title_bg"
                    {...form.register('title_bg')}
                    placeholder="Въведение в изкуството"
                  />
                  {form.formState.errors.title_bg && (
                    <p className="text-sm text-destructive">{form.formState.errors.title_bg.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_bg">Description (Bulgarian)</Label>
                  <Textarea
                    id="description_bg"
                    {...form.register('description_bg')}
                    placeholder="Кратко описание на курса..."
                    rows={3}
                  />
                  {form.formState.errors.description_bg && (
                    <p className="text-sm text-destructive">{form.formState.errors.description_bg.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content_bg">Detailed Content (Bulgarian)</Label>
                  <Textarea
                    id="content_bg"
                    {...form.register('content_bg')}
                    placeholder="Пълни детайли за курса..."
                    rows={6}
                  />
                  {form.formState.errors.content_bg && (
                    <p className="text-sm text-destructive">{form.formState.errors.content_bg.message}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2 mt-6">
              <Label htmlFor="image">Image Path (optional)</Label>
              <Input
                id="image"
                {...form.register('image')}
                placeholder="/images/courses/course-name.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Path to the image file. Image upload will be implemented in the future.
              </p>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="sort_order">Display Order</Label>
              <Input
                id="sort_order"
                type="number"
                {...form.register('sort_order', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers will appear first in listings.
              </p>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                {...form.register('category')}
                placeholder="Enter the category"
              />
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="published"
                checked={form.watch('published')}
                onCheckedChange={(checked: boolean) => form.setValue('published', checked)}
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
} 