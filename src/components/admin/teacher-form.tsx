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
import { uploadImage, handleDbError, processFormData } from '@/lib/admin-helpers';

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

interface TeacherFormProps {
  initialData?: any;
  teacherId?: string;
  onSubmit?: (data: TeacherFormValues) => Promise<void>;
}

export function TeacherForm({ initialData, teacherId, onSubmit }: TeacherFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teacherData, setTeacherData] = useState<any>(initialData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [activeTab, setActiveTab] = useState('english');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty } } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: teacherData || {
      name: '',
      title_en: '',
      title_bg: '',
      bio_en: '',
      bio_bg: '',
      email: '',
      image: '',
      published: false,
      sort_order: 0,
    },
  });

  // Fetch teacher data if teacherId is provided
  useEffect(() => {
    if (teacherId && !initialData) {
      const fetchTeacher = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          console.log(`Fetching teacher with ID: ${teacherId}`);
          const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', teacherId)
            .single();

          if (error) {
            console.error('Error response from Supabase:', error);
            
            // Handle the case when teacher doesn't exist (probably deleted)
            if (error.code === 'PGRST116' || 
                error.message.includes('rows returned') || 
                error.details?.includes('0 rows')) {
              console.log('Teacher not found, redirecting to list page');
              router.push('/admin/teachers');
              return;
            }
            
            throw error;
          }
          
          if (!data) {
            console.log('No teacher data returned, redirecting to list page');
            router.push('/admin/teachers');
            return;
          }
          
          console.log('Teacher data loaded successfully:', data);
          setTeacherData(data);
          
          if (data.image) {
            setImagePreview(data.image);
          }
          
          // Update form values with the fetched data
          Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              setValue(key as any, value);
            }
          });
        } catch (err) {
          console.error('Error fetching teacher:', err);
          setError('Failed to load teacher data');
        } finally {
          setIsLoading(false);
        }
      };

      fetchTeacher();
    }
  }, [teacherId, initialData, setValue, router]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImagePreview(initialData.image || null);
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

  const handleFormSubmit = async (data: TeacherFormValues) => {
    setIsLoading(true);
    setError(null);
    
    console.log("Form submission started with data:", data);
    
    try {
      // Process the form data
      const processedData = processFormData(data, {
        numberFields: ['sort_order'],
        optionalFields: ['image', 'email'],
        trimFields: ['name', 'title_en', 'title_bg', 'bio_en', 'bio_bg', 'email']
      }) as TeacherFormValues;
      
      // Upload image if there's a new one
      if (imageFile) {
        const imageUrl = await uploadImage(
          imageFile, 
          'teachers', 
          teacherId && teacherData?.image ? teacherData.image : null
        );
        processedData.image = imageUrl || undefined;
      }
      
      if (onSubmit) {
        console.log("Using provided onSubmit handler");
        await onSubmit(processedData);
      } else if (teacherId) {
        // Default update behavior if no onSubmit provided
        console.log("Updating existing teacher with ID:", teacherId);
        const { error: updateError, data: updatedData } = await supabase
          .from('teachers')
          .update(processedData)
          .eq('id', teacherId)
          .select();
          
        if (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }
        
        console.log("Teacher updated successfully:", updatedData);
        // Force refresh after successful update
        router.refresh();
      } else {
        // Default insert behavior if no onSubmit or teacherId provided
        console.log("Inserting new teacher record");
        const { error: insertError, data: insertedData } = await supabase
          .from('teachers')
          .insert(processedData)
          .select();
          
        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
        
        console.log("Teacher inserted successfully:", insertedData);
        // Force refresh after successful insert
        router.refresh();
      }
      
      console.log("Form submission successful, navigating to teacher list");
      // Only navigate away after successful operation
      router.push('/admin/teachers');
    } catch (err: any) {
      console.error('Error saving teacher (detailed):', err);
      setError(handleDbError(err));
      console.error('Error saving teacher:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sort_order">Display Order</Label>
          <Input
            id="sort_order"
            type="number"
            {...register('sort_order', { valueAsNumber: true })}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Lower numbers appear first. Use this to control the display order of teachers.
          </p>
        </div>
      </div>
      
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
              placeholder="e.g., Mathematics Teacher"
            />
            {errors.title_en && (
              <p className="text-sm text-red-500">{errors.title_en.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio_en">Biography (English)</Label>
            <Textarea
              id="bio_en"
              {...register('bio_en')}
              disabled={isLoading}
              rows={6}
            />
            {errors.bio_en && (
              <p className="text-sm text-red-500">{errors.bio_en.message}</p>
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
              placeholder="e.g., Учител по математика"
            />
            {errors.title_bg && (
              <p className="text-sm text-red-500">{errors.title_bg.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio_bg">Biography (Bulgarian)</Label>
            <Textarea
              id="bio_bg"
              {...register('bio_bg')}
              disabled={isLoading}
              rows={6}
            />
            {errors.bio_bg && (
              <p className="text-sm text-red-500">{errors.bio_bg.message}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
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
        <Label htmlFor="published">Publish this teacher profile</Label>
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
          onClick={() => router.push('/admin/teachers')}
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
            'Save Teacher'
          )}
        </Button>
      </div>
    </form>
  );
} 