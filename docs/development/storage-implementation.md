# Supabase Storage Implementation

This document outlines how file storage is implemented in the A&B School website using Supabase Storage.

## Storage Buckets

The application uses multiple storage buckets to organize different types of media:

1. **`news`**: For news article images
2. **`teachers`**: For teacher profile images
3. **`achievements`**: For achievement-related images and documents
4. **`courses`**: For course-related images

## Bucket Setup

Buckets are created and configured using the `setup-storage.js` script in the project root. This script:

1. Creates all required storage buckets
2. Sets appropriate file size limits for each bucket
3. Configures MIME type restrictions for security
4. Sets up proper access control policies
5. Creates folder structures where needed

## Storage Helper Functions

Storage operations are abstracted through helper functions in `/src/lib/storage-helpers.ts`:

### `uploadImage`

```typescript
export async function uploadImage(
  file: File | null, 
  bucketName: string = 'news',
  existingUrl: string | null = null
): Promise<string | null>
```

This function handles:
- Uploading a new image file to the specified bucket
- Generating a unique filename to prevent collisions
- Deleting the old image if replacing an existing one
- Returning the public URL of the uploaded file

### `deleteImage`

```typescript
export async function deleteImage(url: string): Promise<boolean>
```

This function:
- Extracts the bucket name and filename from a storage URL
- Deletes the specified file from Supabase storage
- Returns success/failure status

### Utility Functions

- `extractFilenameFromUrl`: Parses a storage URL to extract the filename
- `extractBucketFromUrl`: Parses a storage URL to extract the bucket name

## Security Policies

Storage security is implemented using Supabase Row-Level Security policies:

1. **Public Read Access**: All files can be read by anyone
2. **Authenticated Write Access**: Only authenticated users can upload, modify, or delete files

These policies are configured in the `setup-storage.js` script and enforced by Supabase.

## Usage in Forms

The storage helpers are integrated into form components throughout the admin dashboard:

1. **Image Selection**: User selects an image file via file input
2. **Image Preview**: Selected image is previewed before upload
3. **Form Submission**: On form submit, image is uploaded to appropriate bucket
4. **URL Storage**: The resulting URL is stored in the database record
5. **Image Replacement**: When editing, existing images can be replaced with new ones

## Example Implementation

Here's an example from the news form component:

```tsx
// In the form component
const [imageFile, setImageFile] = useState<File | null>(null);

// When handling file input change
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImageFile(file);
    // Show preview logic...
  }
};

// On form submission
const handleSubmit = async (data) => {
  if (imageFile) {
    const imageUrl = await uploadImage(imageFile, 'news', data.image);
    if (imageUrl) {
      data.image = imageUrl;
    }
  }
  
  // Continue with saving the data...
};
```

## Courses Implementation

For courses, the same pattern is followed:

```tsx
// In the course form component
const [imageFile, setImageFile] = useState<File | null>(null);

// When handling file input change
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setImageFile(file);
    // Show preview logic...
  }
};

// On form submission
const handleSubmit = async (data) => {
  if (imageFile) {
    const imageUrl = await uploadImage(imageFile, 'courses', data.image);
    if (imageUrl) {
      data.image = imageUrl;
    }
  }
  
  // Continue with saving the data...
};
```

The main difference is that the bucket name is set to 'courses' when uploading images.

## Testing Storage Operations

To verify storage functionality:

1. Run the application locally
2. Log in to the admin area
3. Try uploading images in various forms
4. Check the Supabase dashboard to confirm files are stored correctly

## Troubleshooting

Common issues and solutions:

1. **Upload Failures**: Check file size limits and MIME type restrictions
2. **Missing Images**: Verify URL format and bucket permissions
3. **Permission Errors**: Ensure RLS policies are correctly configured
4. **Storage Quotas**: Monitor Supabase project storage usage 