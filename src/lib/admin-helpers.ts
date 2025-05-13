import { supabase } from './supabase';

/**
 * Helper function to handle image uploads to Supabase storage
 * @param file The file to upload
 * @param folder The folder to store the file in (e.g., 'teachers', 'news')
 * @param existingImageUrl URL of the existing image (for updates)
 * @returns The URL of the uploaded image or undefined if upload fails
 */
export async function uploadImage(
  file: File | null, 
  folder: string = 'general',
  existingImageUrl: string | undefined = undefined
): Promise<string | undefined> {
  if (!file) {
    console.log('No file provided, returning existing URL:', existingImageUrl);
    return existingImageUrl;
  }
  
  try {
    console.log(`Uploading image to ${folder} folder. File: ${file.name}, Size: ${file.size} bytes`);
    
    // Create a safe filename
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    console.log(`Generated safe filename: ${fileName}`);
    
    // Check if user is authenticated before attempting upload
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('User not authenticated for upload');
      throw new Error('Authentication required for uploading files');
    }
    
    // Try to upload to the specific bucket first (teachers, news, etc.)
    let uploadResult;
    let bucketName = folder; // Try using the folder name as the bucket name first
    let filePath = fileName; // For specific buckets, don't add folder to path (prevents "teachers/teachers/file.jpg")
    
    try {
      console.log(`Attempting upload to ${bucketName} bucket with path ${filePath}`);
      uploadResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadResult.error) {
        console.error(`Could not upload to ${bucketName} bucket:`, uploadResult.error);
        throw uploadResult.error; // This will trigger the catch block below
      }
      
      console.log(`Successfully uploaded to ${bucketName} bucket`);
    } catch (bucketError) {
      // If specific bucket fails, try the public1 bucket instead
      console.log('Failed to upload to specific bucket, falling back to public1 bucket');
      bucketName = 'public1';
      
      // For the fallback bucket, use the folder name in the path for organization
      filePath = `${folder}/${fileName}`;
      
      console.log(`Attempting fallback upload to ${bucketName} bucket with path ${filePath}`);
      uploadResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadResult.error) {
        console.error('Upload error on public1 bucket:', uploadResult.error);
        return existingImageUrl;
      }
      
      console.log(`Successfully uploaded to fallback bucket ${bucketName}`);
    }
    
    // Get the public URL from the successful bucket
    console.log(`Getting public URL for ${bucketName}/${filePath}`);
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath); // Always use the same filePath variable that was used for upload
    
    console.log('Image uploaded successfully, public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return existingImageUrl;
  }
}

/**
 * Helper function to handle form data conversion for database operations
 * @param data The form data object
 * @param options Optional processing options
 * @returns Processed data ready for database insertion/update
 */
export function processFormData(
  data: Record<string, any>, 
  options: {
    // Fields that should be parsed as numbers
    numberFields?: string[]; 
    // Fields that are optional and should be null if empty
    optionalFields?: string[];
    // Fields that should be trimmed
    trimFields?: string[];
  } = {}
): Record<string, any> {
  const processedData = { ...data };
  
  // Process number fields
  if (options.numberFields) {
    for (const field of options.numberFields) {
      if (field in processedData && typeof processedData[field] === 'string') {
        processedData[field] = parseFloat(processedData[field]) || 0;
      }
    }
  }
  
  // Process optional fields
  if (options.optionalFields) {
    for (const field of options.optionalFields) {
      if (field in processedData && 
          (processedData[field] === '' || processedData[field] === undefined)) {
        processedData[field] = null;
      }
    }
  }
  
  // Process fields that need trimming
  if (options.trimFields) {
    for (const field of options.trimFields) {
      if (field in processedData && typeof processedData[field] === 'string') {
        processedData[field] = processedData[field].trim();
      }
    }
  }
  
  return processedData;
}

/**
 * Helper function to handle database errors
 * @param error The error object from Supabase
 * @returns A user-friendly error message
 */
export function handleDbError(error: any): string {
  console.error('Database error:', error);
  
  if (error?.code === '23505') {
    return 'A record with this information already exists.';
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
} 