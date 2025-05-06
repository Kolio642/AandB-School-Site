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
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { uploadImage, handleDbError, processFormData } from '@/lib/admin-helpers';

const newsSchema = z.object({
  title_en: z.string().min(3, 'Title is required (min 3 characters)'),
  title_bg: z.string().min(3, 'Title is required (min 3 characters)'),
  summary_en: z.string().min(10, 'Summary is required (min 10 characters)'),
  summary_bg: z.string().min(10, 'Summary is required (min 10 characters)'),
  content_en: z.string().min(50, 'Content is required (min 50 characters)'),
  content_bg: z.string().min(50, 'Content is required (min 50 characters)'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
  published: z.boolean().default(false),
  image: z.string().optional().or(z.literal('')),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: any;
  newsId?: string;
  onSubmit?: (data: NewsFormValues) => Promise<void>;
}

export function NewsForm({ initialData, newsId, onSubmit }: NewsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsData, setNewsData] = useState<any>(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [activeTab, setActiveTab] = useState('english');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: newsData || {
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

  // Fetch news data if newsId is provided
  useEffect(() => {
    if (newsId && !initialData) {
      const fetchNews = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          console.log(`Fetching news with ID: ${newsId}`);
          const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('id', newsId)
            .single();

          if (error) {
            console.error('Error response from Supabase:', error);
            
            // Handle the case when news doesn't exist (probably deleted)
            if (error.code === 'PGRST116' || 
                error.message.includes('rows returned') || 
                error.details?.includes('0 rows')) {
              console.log('News item not found, redirecting to news list page');
              router.push('/admin/news');
              return;
            }
            
            throw error;
          }
          
          if (!data) {
            console.log('No news data returned, redirecting to news list page');
            router.push('/admin/news');
            return;
          }
          
          console.log('News data loaded successfully:', data);
          setNewsData(data);
          
          if (data.image) {
            setImagePreview(data.image);
          }

          // Update form values with the fetched data
          Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              setValue(key as any, value);
            }
          });
          
          // Format date for input field if it exists
          if (data.date) {
            try {
              // Try to parse and format the date
              const dateObj = new Date(data.date);
              const formattedDate = format(dateObj, 'yyyy-MM-dd');
              setValue('date', formattedDate);
            } catch (dateError) {
              console.error('Error formatting date:', dateError);
              // Keep original date string if parsing fails
            }
          }
        } catch (err) {
          console.error('Error fetching news:', err);
          setError('Failed to load news data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchNews();
    }
  }, [newsId, initialData, setValue, router]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      const formData = { ...initialData };
      
      // Format date if it exists
      if (formData.date) {
        try {
          const dateObj = new Date(formData.date);
          formData.date = format(dateObj, 'yyyy-MM-dd');
        } catch (err) {
          console.error('Error formatting date:', err);
        }
      }
      
      reset(formData);
      setImagePreview(formData.image || null);
    }
  }, [initialData, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert file to data URI instead of blob URL to avoid CSP issues
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    setImageFile(file);
  };

  const handleFormSubmit = async (data: NewsFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Process the form data
      const processedData = processFormData(data, {
        optionalFields: ['image', 'content_en', 'content_bg'],
        trimFields: ['title_en', 'title_bg', 'summary_en', 'summary_bg', 'content_en', 'content_bg']
      }) as NewsFormValues;
      
      // Upload image if there's a new one
      if (imageFile) {
        const imageUrl = await uploadImage(
          imageFile, 
          'news', 
          newsId && newsData?.image ? newsData.image : null
        );
        processedData.image = imageUrl || undefined;
      }
      
      if (onSubmit) {
        await onSubmit(processedData);
      } else if (newsId) {
        // Default update behavior if no onSubmit provided
        const { error: updateError } = await supabase
          .from('news')
          .update(processedData)
          .eq('id', newsId);
          
        if (updateError) throw updateError;
        
        // Force refresh after successful update
        router.refresh();
      } else {
        // Default insert behavior if no onSubmit or newsId provided
        const { error: insertError } = await supabase
          .from('news')
          .insert(processedData);
          
        if (insertError) throw insertError;
        
        // Force refresh after successful insert
        router.refresh();
      }
      
      // Only navigate away after successful operation
      router.push('/admin/news');
    } catch (err: any) {
      setError(handleDbError(err));
      console.error('Error saving news item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="english" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="english">English</TabsTrigger>
          <TabsTrigger value="bulgarian">Bulgarian</TabsTrigger>
        </TabsList>
        
        <TabsContent value="english" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title_en">Title (English)</Label>
            <Input
              id="title_en"
              {...register('title_en')}
              disabled={isLoading}
            />
            {errors.title_en && (
              <p className="text-sm text-red-500">{errors.title_en.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary_en">Summary (English)</Label>
            <Textarea
              id="summary_en"
              {...register('summary_en')}
              disabled={isLoading}
              rows={3}
            />
            {errors.summary_en && (
              <p className="text-sm text-red-500">{errors.summary_en.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content_en">Content (English)</Label>
            <Textarea
              id="content_en"
              {...register('content_en')}
              disabled={isLoading}
              rows={10}
            />
            {errors.content_en && (
              <p className="text-sm text-red-500">{errors.content_en.message}</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="bulgarian" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title_bg">Title (Bulgarian)</Label>
            <Input
              id="title_bg"
              {...register('title_bg')}
              disabled={isLoading}
            />
            {errors.title_bg && (
              <p className="text-sm text-red-500">{errors.title_bg.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary_bg">Summary (Bulgarian)</Label>
            <Textarea
              id="summary_bg"
              {...register('summary_bg')}
              disabled={isLoading}
              rows={3}
            />
            {errors.summary_bg && (
              <p className="text-sm text-red-500">{errors.summary_bg.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content_bg">Content (Bulgarian)</Label>
            <Textarea
              id="content_bg"
              {...register('content_bg')}
              disabled={isLoading}
              rows={10}
            />
            {errors.content_bg && (
              <p className="text-sm text-red-500">{errors.content_bg.message}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            disabled={isLoading}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message}</p>
          )}
        </div>
      </div>
      
      {imagePreview && (
        <div className="mt-2">
          <Label>Image Preview</Label>
          <div className="mt-1 border rounded-md overflow-hidden relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-40 object-contain w-full" 
              onError={(e) => {
                // Handle image load error without causing CSP violations
                console.error('Image failed to load:', imagePreview);
                
                // Use data URI directly as fallback instead of trying multiple files
                e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"%3E%3Crect width="40" height="40" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="sans-serif" font-size="8" text-anchor="middle" dominant-baseline="middle" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                
                // Prevent further error handling
                e.currentTarget.onerror = null;
                e.currentTarget.alt = 'Image preview unavailable';
              }}
            />
            <button 
              type="button"
              onClick={() => {
                setImagePreview(null);
                setValue('image', '');
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={watch('published')}
          onCheckedChange={(checked) => setValue('published', checked)}
          disabled={isLoading}
        />
        <Label htmlFor="published">Publish this news item</Label>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/news')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || (!isDirty && !imageFile)}
          className="bg-primary hover:bg-primary/90 text-white font-medium min-w-[120px]"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save News Item'
          )}
        </Button>
      </div>
    </form>
  );
} 