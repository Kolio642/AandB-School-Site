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
import { Achievement } from '@/lib/database';

// Categories for achievements
const ACHIEVEMENT_CATEGORIES = [
  'academic',
  'sports',
  'arts',
  'science',
  'math',
  'language',
  'community'
];

// Define the form schema based on achievements table
const formSchema = z.object({
  title_en: z.string().min(1, 'Title in English is required'),
  title_bg: z.string().min(1, 'Title in Bulgarian is required'),
  description_en: z.string().min(1, 'Description in English is required'),
  description_bg: z.string().min(1, 'Description in Bulgarian is required'),
  date: z.string().min(1, 'Date is required'),
  student_name: z.string().nullable().optional(),
  category: z.string().min(1, 'Category is required'),
  image: z.string().nullable().optional(),
  published: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface AchievementFormProps {
  initialData?: Achievement;
  achievementId?: string;
  onSubmit: (data: FormValues & { imageFile?: File | null }) => Promise<void>;
}

export function AchievementForm({ initialData, achievementId, onSubmit }: AchievementFormProps) {
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
      date: initialData?.date || new Date().toISOString().split('T')[0],
      student_name: initialData?.student_name || '',
      category: initialData?.category || 'academic',
      image: initialData?.image || null,
      published: initialData?.published || false,
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
        const imageUrl = await uploadImage(imageFile, 'achievements', values.image || undefined);
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
      {/* Title fields (Bulgarian & English) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title_bg">Заглавие (Bulgarian)</Label>
          <Input
            id="title_bg"
            {...form.register('title_bg')}
            placeholder="Въведете заглавие на български"
          />
          {form.formState.errors.title_bg && (
            <p className="text-sm text-red-500">{form.formState.errors.title_bg.message}</p>
          )}
        </div>
        
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
      </div>
      
      {/* Description fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description_bg">Описание (Bulgarian)</Label>
          <Textarea
            id="description_bg"
            {...form.register('description_bg')}
            placeholder="Въведете описание на български"
            rows={4}
          />
          {form.formState.errors.description_bg && (
            <p className="text-sm text-red-500">{form.formState.errors.description_bg.message}</p>
          )}
        </div>
        
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
      </div>
      
      {/* Date and Student Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...form.register('date')}
          />
          {form.formState.errors.date && (
            <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="student_name">Student Name (optional)</Label>
          <Input
            id="student_name"
            {...form.register('student_name')}
            placeholder="Enter student name (if applicable)"
          />
        </div>
      </div>
      
      {/* Category */}
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
            {ACHIEVEMENT_CATEGORIES.map((category) => (
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
      
      {/* Image upload */}
      <div className="space-y-3">
        <Label>Image</Label>
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
              Recommended size: 800x600px. Max size: 2MB.
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
          {isSubmitting ? 'Saving...' : achievementId ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
} 