'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { uploadImage } from '@/lib/storage-helpers';
import { Teacher } from '@/lib/database';

// Define the form schema based on the teacher table
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title_en: z.string().min(1, 'Title in English is required'),
  title_bg: z.string().min(1, 'Title in Bulgarian is required'),
  bio_en: z.string().min(1, 'Biography in English is required'),
  bio_bg: z.string().min(1, 'Biography in Bulgarian is required'),
  email: z.string().email('Invalid email').nullable().optional(),
  image: z.string().nullable().optional(),
  published: z.boolean(),
  sort_order: z.number().int().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface TeacherFormProps {
  initialData?: Teacher;
  teacherId?: string;
  onSubmit: (data: FormValues & { imageFile?: File | null }) => Promise<void>;
}

export function TeacherForm({ initialData, teacherId, onSubmit }: TeacherFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up form with initial values if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      title_en: initialData?.title_en || '',
      title_bg: initialData?.title_bg || '',
      bio_en: initialData?.bio_en || '',
      bio_bg: initialData?.bio_bg || '',
      email: initialData?.email || '',
      image: initialData?.image || null,
      published: initialData?.published ?? true,
      sort_order: initialData?.sort_order || 0,
    },
  });

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // If there's a new image file, upload it
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, 'teachers', values.image || undefined);
        if (imageUrl) {
          values.image = imageUrl;
        }
      }
      
      // Submit the form data
      await onSubmit({ ...values, imageFile });
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Name and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Enter teacher's name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (optional)</Label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="Enter teacher's email"
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>
      
      {/* Title fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title_en">Title (English)</Label>
          <Input
            id="title_en"
            {...form.register('title_en')}
            placeholder="Enter title in English"
          />
          {form.formState.errors.title_en && (
            <p className="text-sm text-red-500">{form.formState.errors.title_en.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title_bg">Title (Bulgarian)</Label>
          <Input
            id="title_bg"
            {...form.register('title_bg')}
            placeholder="Enter title in Bulgarian"
          />
          {form.formState.errors.title_bg && (
            <p className="text-sm text-red-500">{form.formState.errors.title_bg.message}</p>
          )}
        </div>
      </div>
      
      {/* Biography fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bio_en">Biography (English)</Label>
          <Textarea
            id="bio_en"
            {...form.register('bio_en')}
            placeholder="Enter biography in English"
            rows={4}
          />
          {form.formState.errors.bio_en && (
            <p className="text-sm text-red-500">{form.formState.errors.bio_en.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio_bg">Biography (Bulgarian)</Label>
          <Textarea
            id="bio_bg"
            {...form.register('bio_bg')}
            placeholder="Enter biography in Bulgarian"
            rows={4}
          />
          {form.formState.errors.bio_bg && (
            <p className="text-sm text-red-500">{form.formState.errors.bio_bg.message}</p>
          )}
        </div>
      </div>
      
      {/* Sort Order */}
      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          min="0"
          {...form.register('sort_order', { valueAsNumber: true })}
        />
        <p className="text-sm text-muted-foreground">
          Lower numbers appear first. Use this to control the order of teachers on the page.
        </p>
        {form.formState.errors.sort_order && (
          <p className="text-sm text-red-500">{form.formState.errors.sort_order.message}</p>
        )}
      </div>
      
      {/* Image upload */}
      <div className="space-y-3">
        <Label>Profile Image</Label>
        <div className="flex items-start space-x-4">
          {/* Image preview */}
          {imagePreview && (
            <div className="relative w-32 h-32 border rounded-full overflow-hidden">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="object-cover w-full h-full"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Recommended: Square image (1:1). Max size: 2MB.
            </p>
          </div>
        </div>
      </div>
      
      {/* Published switch */}
      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={form.watch('published')}
          onCheckedChange={(checked) => form.setValue('published', checked)}
        />
        <Label htmlFor="published">Published</Label>
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : teacherId ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
} 