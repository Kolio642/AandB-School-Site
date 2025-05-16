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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { uploadImage } from '@/lib/storage-helpers';
import { Course } from '@/lib/database';

// Categories for courses
const COURSE_CATEGORIES = [
  'language',
  'science',
  'math',
  'arts',
  'technology',
  'sports',
  'humanities'
];

// Define the form schema based on courses table
const formSchema = z.object({
  title_en: z.string().min(1, 'Title in English is required'),
  title_bg: z.string().min(1, 'Title in Bulgarian is required'),
  description_en: z.string().min(1, 'Description in English is required'),
  description_bg: z.string().min(1, 'Description in Bulgarian is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().nullable().optional(),
  published: z.boolean(),
  sort_order: z.number().int().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseFormProps {
  initialData?: Course;
  courseId?: string;
  onSubmit: (data: FormValues & { imageFile?: File | null }) => Promise<void>;
}

export function CourseForm({ initialData, courseId, onSubmit }: CourseFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set up form with initial values if editing
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title_en: initialData?.title_en || '',
      title_bg: initialData?.title_bg || '',
      description_en: initialData?.description_en || '',
      description_bg: initialData?.description_bg || '',
      category: initialData?.category || 'language',
      image: initialData?.image || null,
      published: initialData?.published ?? false,
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
        const imageUrl = await uploadImage(imageFile, 'courses', values.image || undefined);
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
    <form onSubmit={form.handleSubmit(handleSubmit as any)} className="space-y-6">
      {/* Title fields (English & Bulgarian) */}
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
      
      {/* Description fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description_en">Description (English)</Label>
          <Textarea
            id="description_en"
            {...form.register('description_en')}
            placeholder="Enter description in English"
            rows={4}
          />
          {form.formState.errors.description_en && (
            <p className="text-sm text-red-500">{form.formState.errors.description_en.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description_bg">Description (Bulgarian)</Label>
          <Textarea
            id="description_bg"
            {...form.register('description_bg')}
            placeholder="Enter description in Bulgarian"
            rows={4}
          />
          {form.formState.errors.description_bg && (
            <p className="text-sm text-red-500">{form.formState.errors.description_bg.message}</p>
          )}
        </div>
      </div>
      
      {/* Category and Sort Order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.watch('category')}
            onValueChange={(value) => form.setValue('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {COURSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.category && (
            <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            min="0"
            {...form.register('sort_order', { valueAsNumber: true })}
          />
          <p className="text-sm text-muted-foreground">
            Lower numbers appear first
          </p>
          {form.formState.errors.sort_order && (
            <p className="text-sm text-red-500">{form.formState.errors.sort_order.message}</p>
          )}
        </div>
      </div>
      
      {/* Image upload */}
      <div className="space-y-3">
        <Label>Course Image</Label>
        <div className="flex items-start space-x-4">
          {/* Image preview */}
          {imagePreview && (
            <div className="relative w-32 h-32 border rounded-md overflow-hidden">
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
              Recommended: 16:9 aspect ratio. Max size: 2MB.
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
          {isSubmitting ? 'Saving...' : courseId ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
} 