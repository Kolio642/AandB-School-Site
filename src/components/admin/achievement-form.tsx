import { useEffect, useState } from 'react';
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

const achievementSchema = z.object({
  title_en: z.string().min(3, 'Title is required (min 3 characters)'),
  title_bg: z.string().min(3, 'Title is required (min 3 characters)'),
  description_en: z.string().min(10, 'Description is required (min 10 characters)'),
  description_bg: z.string().min(10, 'Description is required (min 10 characters)'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
  category: z.string().min(1, 'Category is required'),
  published: z.boolean().default(false),
  student_name: z.string().optional(),
  image: z.string().optional(),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

interface AchievementFormProps {
  initialData?: any;
  achievementId?: string;
  onSubmit?: (data: AchievementFormValues) => Promise<void>;
}

export function AchievementForm({ initialData, achievementId, onSubmit }: AchievementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [achievementData, setAchievementData] = useState<any>(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [activeTab, setActiveTab] = useState('english');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: achievementData || {
      title_en: '',
      title_bg: '',
      description_en: '',
      description_bg: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      published: false,
      student_name: '',
      image: '',
    },
  });

  // Fetch achievement data if achievementId is provided
  useEffect(() => {
    if (achievementId && !initialData) {
      const fetchAchievement = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', achievementId)
            .single();

          if (error) throw error;
          
          setAchievementData(data);
          if (data?.image) {
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
              // Try to parse and format the date (handles different date formats)
              const dateObj = new Date(data.date);
              const formattedDate = format(dateObj, 'yyyy-MM-dd');
              setValue('date', formattedDate);
            } catch (dateError) {
              console.error('Error formatting date:', dateError);
              // Keep original date string if parsing fails
            }
          }
        } catch (err) {
          console.error('Error fetching achievement:', err);
          setError('Failed to load achievement data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchAchievement();
    }
  }, [achievementId, initialData, setValue]);

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

  const handleFormSubmit = async (data: AchievementFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Upload image if there's a new one
      if (imageFile) {
        const fileName = `achievements/${Date.now()}-${imageFile.name}`;
        
        try {
          console.log('Attempting to upload to storage');
          
          // Try direct upload to the 'public' bucket
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('public')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: true
            });
            
          if (uploadError) {
            console.error('Upload error:', uploadError.message);
            
            // If we're updating an existing record and already have an image, use the existing one
            if (achievementId && achievementData?.image) {
              data.image = achievementData.image;
              console.log('Keeping existing image instead');
            } else {
              // Clear the image field if we can't upload
              data.image = '';
              console.log('Proceeding without image');
            }
          } else {
            // Upload succeeded
            const { data: urlData } = supabase.storage.from('public').getPublicUrl(fileName);
            data.image = urlData.publicUrl;
            console.log('Successfully uploaded image:', urlData.publicUrl);
          }
        } catch (error) {
          console.error('Unexpected error during upload:', error);
          // If upload completely fails, use existing image or proceed without one
          if (achievementId && achievementData?.image) {
            data.image = achievementData.image;
          } else {
            data.image = '';
          }
        }
      }
      
      if (onSubmit) {
        await onSubmit(data);
      } else if (achievementId) {
        // Default update behavior if no onSubmit provided
        const { error: updateError } = await supabase
          .from('achievements')
          .update(data)
          .eq('id', achievementId);
          
        if (updateError) throw updateError;
        
        // Force refresh after successful update
        router.refresh();
      } else {
        // Default insert behavior if no onSubmit or achievementId provided
        const { error: insertError } = await supabase
          .from('achievements')
          .insert(data);
          
        if (insertError) throw insertError;
        
        // Force refresh after successful insert
        router.refresh();
      }
      
      // Only navigate away after successful operation
      router.push('/admin/achievements');
    } catch (err: any) {
      setError(err.message || 'Failed to save achievement');
      console.error('Error saving achievement:', err);
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
            <Label htmlFor="description_en">Description (English)</Label>
            <Textarea
              id="description_en"
              {...register('description_en')}
              disabled={isLoading}
              rows={6}
            />
            {errors.description_en && (
              <p className="text-sm text-red-500">{errors.description_en.message}</p>
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
            <Label htmlFor="description_bg">Description (Bulgarian)</Label>
            <Textarea
              id="description_bg"
              {...register('description_bg')}
              disabled={isLoading}
              rows={6}
            />
            {errors.description_bg && (
              <p className="text-sm text-red-500">{errors.description_bg.message}</p>
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
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            {...register('category')}
            disabled={isLoading}
            placeholder="e.g., Competition, Award"
          />
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="student_name">Student Name (Optional)</Label>
        <Input
          id="student_name"
          {...register('student_name')}
          disabled={isLoading}
          placeholder="Name of the student who achieved this (if applicable)"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="image">Image (Optional)</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isLoading}
        />
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
        <Label htmlFor="published">Publish this achievement</Label>
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
          onClick={() => router.push('/admin/achievements')}
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
            'Save Achievement'
          )}
        </Button>
      </div>
    </form>
  );
} 