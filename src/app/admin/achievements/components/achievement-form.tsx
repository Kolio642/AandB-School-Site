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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadImage } from '@/lib/storage-helpers';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

// Schema with validation
const achievementSchema = z.object({
  title_en: z.string().min(1, 'English title is required'),
  title_bg: z.string().min(1, 'Bulgarian title is required'),
  description_en: z.string().min(1, 'English description is required'),
  description_bg: z.string().min(1, 'Bulgarian description is required'),
  date: z.string().min(1, 'Date is required'),
  student_name: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  published: z.boolean().default(false),
  image: z.string().optional(),
  // This field won't be sent to the database but is used to handle file uploads
  imageFile: z.any().optional(),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

// Achievement categories
const ACHIEVEMENT_CATEGORIES = [
  'Competition Award',
  'Olympiad Award',
  'School Achievement',
  'Student Project',
  'Scholarship',
  'Certificate',
  'Other'
];

interface AchievementFormProps {
  initialData?: any;
  achievementId?: string;
  onSubmit: (data: AchievementFormValues) => Promise<void>;
}

export function AchievementForm({ initialData, achievementId, onSubmit }: AchievementFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [activeTab, setActiveTab] = useState('english');

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isDirty }, control } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: initialData || {
      title_en: '',
      title_bg: '',
      description_en: '',
      description_bg: '',
      date: new Date().toISOString().split('T')[0],
      student_name: '',
      category: '',
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

  const handleFormSubmit = async (data: AchievementFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let processedData = { ...data };
      
      // Handle image upload if file is selected
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, 'achievements', data.image);
        processedData.image = imageUrl || undefined;
      }
      
      // Call the provided onSubmit handler
      await onSubmit(processedData);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error in achievement form:', err);
      
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

  const handleCategoryChange = (value: string) => {
    setValue('category', value, { shouldValidate: true });
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
              placeholder="Enter achievement title in English"
            />
            {errors.title_en && (
              <p className="text-sm text-red-500">{errors.title_en.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description_en">Description (English) *</Label>
            <Textarea
              id="description_en"
              {...register('description_en')}
              disabled={isLoading}
              placeholder="Enter the achievement description in English"
              rows={5}
            />
            {errors.description_en && (
              <p className="text-sm text-red-500">{errors.description_en.message}</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="bulgarian" className="space-y-4">
          <div>
            <Label htmlFor="title_bg">Title (Bulgarian) *</Label>
            <Input
              id="title_bg"
              {...register('title_bg')}
              disabled={isLoading}
              placeholder="Enter achievement title in Bulgarian"
            />
            {errors.title_bg && (
              <p className="text-sm text-red-500">{errors.title_bg.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="description_bg">Description (Bulgarian) *</Label>
            <Textarea
              id="description_bg"
              {...register('description_bg')}
              disabled={isLoading}
              placeholder="Enter the achievement description in Bulgarian"
              rows={5}
            />
            {errors.description_bg && (
              <p className="text-sm text-red-500">{errors.description_bg.message}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="student_name">Student Name (optional)</Label>
          <Input
            id="student_name"
            {...register('student_name')}
            disabled={isLoading}
            placeholder="Enter student name if applicable"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            onValueChange={handleCategoryChange}
            defaultValue={initialData?.category || ''}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select achievement category" />
            </SelectTrigger>
            <SelectContent>
              {ACHIEVEMENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="date">Achievement Date *</Label>
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
        
        <div>
          <Label htmlFor="image">Achievement Image</Label>
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
            checked={watch('published')}
            onCheckedChange={(checked) => setValue('published', checked)}
            disabled={isLoading}
          />
          <Label htmlFor="published">Publish this achievement</Label>
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
          onClick={() => router.push('/admin/achievements')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (achievementId ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
} 