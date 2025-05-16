import { supabase } from '@/lib/supabase';

/**
 * Uploads an image to Supabase Storage
 * @param file The file to upload
 * @param bucketName The bucket name (news, teachers, achievements, etc.)
 * @param existingUrl Optional existing URL to replace
 * @returns The public URL of the uploaded file or null if failed
 */
export async function uploadImage(
  file: File | null, 
  bucketName: string = 'news',
  existingUrl: string | null = null
): Promise<string | null> {
  if (!file) return existingUrl;
  
  try {
    console.log(`Uploading file to ${bucketName} bucket:`, file.name);
    
    // Generate a unique filename with timestamp to avoid collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Upload to specified bucket
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
    
    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      throw error;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    // Delete old image if it exists and is different
    if (existingUrl) {
      try {
        await deleteImage(existingUrl);
      } catch (deleteError) {
        console.error('Error deleting old image:', deleteError);
        // Continue anyway - we don't want to fail the upload if deletion fails
      }
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return existingUrl;
  }
}

/**
 * Extracts the filename from a Supabase Storage URL
 * @param url The Supabase Storage URL
 * @returns The extracted filename
 */
export function extractFilenameFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Last part of the path is the filename
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    return null;
  }
}

/**
 * Extracts the bucket name from a Supabase Storage URL
 * @param url The Supabase Storage URL
 * @returns The extracted bucket name
 */
export function extractBucketFromUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    // URL format: https://xxx.supabase.co/storage/v1/object/public/bucketname/filename
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    // Find the index of 'public' and take the next part as the bucket name
    const publicIndex = pathParts.findIndex(part => part === 'public');
    if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
      return pathParts[publicIndex + 1];
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting bucket from URL:', error);
    return null;
  }
}

/**
 * Deletes an image from Supabase Storage
 * @param url The Supabase Storage URL of the image to delete
 * @returns True if deletion was successful
 */
export async function deleteImage(url: string): Promise<boolean> {
  if (!url) return false;
  
  try {
    // Check if it's an external URL (not from our Supabase storage)
    if (!url.includes('supabase.co/storage')) {
      console.log('External URL detected, skipping deletion:', url);
      return true; // Return true since there's no need to delete external URLs
    }
    
    const bucketName = extractBucketFromUrl(url);
    const fileName = extractFilenameFromUrl(url);
    
    if (!bucketName || !fileName) {
      console.error('Invalid URL format for deletion:', url);
      return false;
    }
    
    console.log(`Deleting file ${fileName} from ${bucketName} bucket`);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);
    
    if (error) {
      console.error(`Error deleting file from ${bucketName}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteImage:', error);
    return false;
  }
} 