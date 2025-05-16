'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Trophy, ImagePlus, Loader2 } from 'lucide-react';

const achievementSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  image_url: z.string().optional(),
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

export default function CreateAchievementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  async function onSubmit(data: AchievementFormValues) {
    setIsSubmitting(true);

    try {
      let imageUrl = data.image_url;

      // Upload image if selected
      if (imageFile) {
        // Image upload logic would go here
        // For now, we're just simulating the URL
        imageUrl = `https://example.com/images/${imageFile.name}`;
      }

      // Add created_at and updated_at fields
      const now = new Date().toISOString();
      const achievementData = {
        title: data.title,
        description: data.description,
        image_url: imageUrl,
        created_at: now,
        updated_at: now,
      };
      
      // Add achievement to the database 
      // (In real implementation, you would add proper error handling)
      // This is just a UI mock, functionality is not implemented as per requirements

      toast({
        title: 'Success',
        description: 'Achievement created successfully',
      });
      
      // Redirect to achievements list
      router.push('/admin/achievements');
    } catch (error: any) {
      console.error('Error creating achievement:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create achievement',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Achievement</h1>
          <p className="text-muted-foreground mt-1">
            Add a new school achievement or award
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Achievement Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter achievement title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Enter achievement description"
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center gap-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer w-full">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Label htmlFor="image" className="cursor-pointer block">
                    <div className="flex flex-col items-center gap-2">
                      {imagePreview ? (
                        <div className="w-full aspect-video overflow-hidden rounded-md">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <>
                          <ImagePlus className="h-10 w-10 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Click to upload an image
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-amber-500 hover:bg-amber-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    Create Achievement
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 