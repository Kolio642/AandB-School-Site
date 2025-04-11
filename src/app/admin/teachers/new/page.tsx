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
const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title_en: z.string().min(1, 'English title is required'),
  title_bg: z.string().min(1, 'Bulgarian title is required'),
  bio_en: z.string().min(1, 'English bio is required'),
  bio_bg: z.string().min(1, 'Bulgarian bio is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  image: z.string().optional(),
  published: z.boolean().default(false),
  sort_order: z.number().default(0),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

export default function NewTeacherPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: '',
      title_en: '',
      title_bg: '',
      bio_en: '',
      bio_bg: '',
      email: '',
      image: '/images/teachers/placeholder.jpg',
      published: false,
      sort_order: 0,
    },
  });

  async function onSubmit(data: TeacherFormValues) {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('teachers')
        .insert({
          name: data.name,
          title_en: data.title_en,
          title_bg: data.title_bg,
          bio_en: data.bio_en,
          bio_bg: data.bio_bg,
          email: data.email || null,
          image: data.image || null,
          published: data.published,
          sort_order: data.sort_order,
        });
      
      if (error) throw error;
      
      router.push('/admin/teachers');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      alert(`Error creating teacher: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Teacher</h1>
        <p className="text-muted-foreground mt-2">
          Create a new teacher profile for the website.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Teacher Information</CardTitle>
            <CardDescription>
              Enter the basic information for the teacher.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Dr. John Smith"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="john.smith@example.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image Path (optional)</Label>
                <Input
                  id="image"
                  {...form.register('image')}
                  placeholder="/images/teachers/teacher-name.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Path to the image file. Image upload will be implemented in the future.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Display Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  {...form.register('sort_order', { valueAsNumber: true })}
                  defaultValue={0}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first. Use this to control the display order of teachers.
                </p>
              </div>
            </div>
          </CardContent>

          <CardHeader className="border-t pt-6">
            <CardTitle>Content</CardTitle>
            <CardDescription>
              Enter the teacher information in both languages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="english" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="bulgarian">Bulgarian</TabsTrigger>
              </TabsList>
              
              <TabsContent value="english" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title_en">Title / Position (English)</Label>
                  <Input
                    id="title_en"
                    {...form.register('title_en')}
                    placeholder="Mathematics Teacher"
                  />
                  {form.formState.errors.title_en && (
                    <p className="text-sm text-destructive">{form.formState.errors.title_en.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio_en">Biography (English)</Label>
                  <Textarea
                    id="bio_en"
                    {...form.register('bio_en')}
                    placeholder="Teacher biography in English..."
                    rows={6}
                  />
                  {form.formState.errors.bio_en && (
                    <p className="text-sm text-destructive">{form.formState.errors.bio_en.message}</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="bulgarian" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title_bg">Title / Position (Bulgarian)</Label>
                  <Input
                    id="title_bg"
                    {...form.register('title_bg')}
                    placeholder="Учител по математика"
                  />
                  {form.formState.errors.title_bg && (
                    <p className="text-sm text-destructive">{form.formState.errors.title_bg.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio_bg">Biography (Bulgarian)</Label>
                  <Textarea
                    id="bio_bg"
                    {...form.register('bio_bg')}
                    placeholder="Биография на учителя на български..."
                    rows={6}
                  />
                  {form.formState.errors.bio_bg && (
                    <p className="text-sm text-destructive">{form.formState.errors.bio_bg.message}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.push('/admin/teachers')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button
                type="submit"
                onClick={() => form.setValue('published', false)}
                variant="outline"
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                onClick={() => form.setValue('published', true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
} 