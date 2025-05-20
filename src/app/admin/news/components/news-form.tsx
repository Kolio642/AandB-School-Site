'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadImage } from '@/lib/storage-helpers';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

// Schema with validation
const newsSchema = z.object({
  title_en: z.string().min(1, 'English title is required'),
  title_bg: z.string().optional().default(''),
  summary_en: z.string().optional().default(''),
  summary_bg: z.string().optional().default(''),
  content_en: z.string().optional().default(''),
  content_bg: z.string().optional().default(''),
  date: z.string().optional().default(() => new Date().toISOString().split('T')[0]),
  published: z.boolean().default(false),
  image: z.string().optional(),
  // This field won't be sent to the database but is used to handle file uploads
  imageFile: z.any().optional(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: any;
  newsId?: string;
  onSubmit: (data: NewsFormValues) => Promise<void>;
}

export function NewsForm({ initialData, newsId, onSubmit }: NewsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [activeTab, setActiveTab] = useState('english');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema) as any,
    defaultValues: initialData || {
      title_en: '',
      title_bg: '',
      summary_en: '',
      summary_bg: '',
      content_en: '',
      content_bg: '',
      date: new Date().toISOString().split('T')[0],
      published: false,
      image: '',
    },
  });

  // Format date for input field if it exists
  useEffect(() => {
    if (initialData?.date) {
      try {
        const dateObj = new Date(initialData.date);
        const formattedDate = format(dateObj, 'yyyy-MM-dd');
        setValue('date', formattedDate);
      } catch (err) {
        console.error('Error formatting date:', err);
      }
    }
  }, [initialData, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    
    // Set the file for upload
    setImageFile(file);
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (data: NewsFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let processedData = { ...data };
      
      // Handle image upload if file is selected
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, 'news', data.image);
        processedData.image = imageUrl || undefined;
      }
      
      // Call the provided onSubmit handler
      await onSubmit(processedData);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error in news form:', err);
      
      // Show error toast
      toast({
        title: "Error",
        description: err.message || 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="english">English</TabsTrigger>
          <TabsTrigger value="bulgarian">Bulgarian</TabsTrigger>
        </TabsList>
        
        <TabsContent value="english" className="space-y-4">
          <div>
            <Label htmlFor="title_en">Title (English) *</Label>
            <Input
              id="title_en"
              {...register('title_en')}
              disabled={isLoading}
              placeholder="Enter news title in English"
            />
            {errors.title_en && (
              <p className="text-sm text-red-500">{errors.title_en.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="summary_en">Summary (English)</Label>
            <Textarea
              id="summary_en"
              {...register('summary_en')}
              disabled={isLoading}
              placeholder="Enter a brief summary in English"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="content_en">Content (English)</Label>
            <Textarea
              id="content_en"
              {...register('content_en')}
              disabled={isLoading}
              placeholder="Enter the full news content in English"
              rows={10}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="bulgarian" className="space-y-4">
          <div>
            <Label htmlFor="title_bg">Title (Bulgarian)</Label>
            <Input
              id="title_bg"
              {...register('title_bg')}
              disabled={isLoading}
              placeholder="Enter news title in Bulgarian"
            />
          </div>
          
          <div>
            <Label htmlFor="summary_bg">Summary (Bulgarian)</Label>
            <Textarea
              id="summary_bg"
              {...register('summary_bg')}
              disabled={isLoading}
              placeholder="Enter a brief summary in Bulgarian"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="content_bg">Content (Bulgarian)</Label>
            <Textarea
              id="content_bg"
              {...register('content_bg')}
              disabled={isLoading}
              placeholder="Enter the full news content in Bulgarian"
              rows={10}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="date">Publication Date</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <Label htmlFor="image">Featured Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
            className="mb-2"
          />
          
          {imagePreview && (
            <div className="mt-2">
              <p className="text-sm mb-2">Image Preview:</p>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-xs max-h-60 object-contain border rounded-md" 
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="published"
            {...register('published')}
            disabled={isLoading}
          />
          <Label htmlFor="published">Publish this news article</Label>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/news')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (newsId ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
} 