# Supabase Storage Implementation Guide

This document provides a comprehensive guide to implementing and managing file storage with Supabase Storage in our application. It covers setting up buckets, organizing with folders, managing uploads, security considerations, and common use cases.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Storage Architecture](#storage-architecture)
- [Bucket Setup & Configuration](#bucket-setup--configuration)
- [Folder Organization](#folder-organization)
- [Upload Implementation](#upload-implementation)
- [Access Control & Security](#access-control--security)
- [Image Transformations](#image-transformations)
- [Common Use Cases](#common-use-cases)
- [Limitations & Considerations](#limitations--considerations)
- [Troubleshooting](#troubleshooting)

## Overview

Supabase Storage is an S3-compatible object storage service integrated with the Supabase ecosystem. It provides an easy way to store and serve files of any type with robust access control policies. Our application uses Supabase Storage to manage various media assets including:

- Teacher profile images
- News article images and attachments
- Student achievement photos
- Course materials
- General site assets

## Features

- **S3-Compatible API**: Use familiar S3 conventions and tools
- **Multiple Upload Methods**: Standard uploads, resumable uploads, and S3 API
- **Global CDN**: Files served from 285+ locations worldwide for low latency
- **Image Transformations**: Resize and optimize images on-the-fly (paid plans)
- **Security Integration**: Leverages Postgres RLS for access control
- **Dashboard Management**: UI for organizing and managing files

## Storage Architecture

In our implementation, we use a bucket-based approach with the following structure:

```
Buckets:
├── teachers
│   └── [teacher profile images]
├── news
│   └── [news article images]
├── achievements
│   └── [achievement images]
│   └── [certificates]
└── public1 (fallback bucket)
    ├── teachers/
    ├── news/
    ├── achievements/
    └── general/
```

Each primary bucket (teachers, news, achievements) is dedicated to storing specific content types. The `public1` bucket serves as a fallback for organizational purposes.

## Bucket Setup & Configuration

### Creating Buckets

We use dedicated Node.js scripts to create and configure buckets consistently. Here's our approach:

1. **Script Structure**: Each bucket has its own creation script

```javascript
// Example from create-bucket.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('bucketName', {
    public: true, // Make it public so files can be accessed without authentication
    fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
  });
  
  if (error) {
    // Handle error
  } else {
    console.log('Bucket created successfully');
  }
}
```

2. **Bucket Configuration Options**:

| Option | Description | Our Setting |
|--------|-------------|-------------|
| `public` | Whether files are publicly accessible by default | `true` for public assets |
| `fileSizeLimit` | Maximum file size allowed | 50MB (current free tier limit) |
| `allowedMimeTypes` | Restricts file types | Not set (allows all types) |

3. **Running Bucket Creation**:

```bash
# From project root
node src/scripts/create-bucket.js
node src/scripts/create-news-bucket.js
```

### Checking Bucket Existence

Before attempting to create a bucket, you can check if it already exists:

```javascript
const { data, error } = await supabase.storage.getBucket('bucketName');
if (error && error.message.includes('not found')) {
  // Bucket doesn't exist, create it
} else {
  console.log('Bucket already exists');
}
```

## Folder Organization

Supabase Storage doesn't have actual "folders" like a traditional filesystem. Instead, folders are simulated using path prefixes in the object names.

### Creating Folder Structure

1. **Implicit Creation**: Folders are created automatically when uploading files with path prefixes

```javascript
// This creates a "certificates" folder in the "achievements" bucket
await supabase.storage
  .from('achievements')
  .upload('certificates/award2023.pdf', fileData);
```

2. **Empty Folder Creation**: For organizational purposes, you can create empty folders by uploading a zero-byte file

```javascript
await supabase.storage
  .from('news')
  .upload('featured/.emptydir', new Uint8Array(0));
```

### Listing Files in a Folder

```javascript
const { data, error } = await supabase.storage
  .from('news')
  .list('2023', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });
```

## Upload Implementation

Our application uses a consistent helper function for handling file uploads:

```typescript
// From src/lib/admin-helpers.ts
export async function uploadImage(
  file: File | null, 
  folder: string = 'general',
  existingImageUrl: string | null = null
): Promise<string | null> {
  if (!file) return existingImageUrl;
  
  try {
    // Create a safe filename
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required for uploading files');
    }
    
    // Try specific bucket first, fall back to public1
    let bucketName = folder;
    let filePath = fileName;
    
    try {
      // Try upload to specific bucket
      let uploadResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadResult.error) throw uploadResult.error;
      
    } catch (bucketError) {
      // Fall back to public1 bucket
      bucketName = 'public1';
      filePath = `${folder}/${fileName}`;
      
      uploadResult = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return existingImageUrl;
  }
}
```

### Upload Options

When uploading files, we can use several options:

| Option | Description | Our Setting |
|--------|-------------|-------------|
| `cacheControl` | Controls browser caching | `3600` (1 hour) |
| `upsert` | Replace if exists | `true` |
| `contentType` | Force MIME type | Auto-detected |

### Handling Large Uploads

For larger files (>10MB), consider using resumable uploads with the TUS protocol:

```javascript
// Client side code using Uppy
import Uppy from '@uppy/core';
import Tus from '@uppy/tus';

const uppy = new Uppy()
  .use(Tus, {
    endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
    headers: {
      authorization: `Bearer ${supabaseKey}`,
      apikey: supabaseKey,
    },
    chunkSize: 6 * 1024 * 1024,
  });

uppy.on('complete', (result) => {
  console.log('Upload complete:', result);
});
```

## Access Control & Security

Supabase Storage security is built on Postgres Row Level Security (RLS), allowing fine-grained access control.

### Public vs. Private Buckets

1. **Public Buckets**: Files are accessible to anyone with the URL

```javascript
// Creating a public bucket
await supabase.storage.createBucket('news', {
  public: true
});

// Getting public URL
const { data } = supabase.storage
  .from('news')
  .getPublicUrl('article1/header.jpg');
```

2. **Private Buckets**: Files require authentication or signed URLs

```javascript
// Creating a private bucket
await supabase.storage.createBucket('user-uploads', {
  public: false
});

// Getting a signed URL (time-limited access)
const { data } = await supabase.storage
  .from('user-uploads')
  .createSignedUrl('private-file.pdf', 60); // 60 seconds expiry
```

### Implementing Custom Security Policies

For more complex access control, we can define RLS policies in SQL:

```sql
-- Allow users to access only their own files
CREATE POLICY "Users can access own files"
ON storage.objects
FOR SELECT
USING (auth.uid() = owner_id);

-- Allow specific role to access certain files
CREATE POLICY "Admins can access all files"
ON storage.objects
FOR ALL
USING (auth.jwt() ->> 'role' = 'admin');
```

## Image Transformations

On paid plans, Supabase offers image transformations to resize, crop, and optimize images on-the-fly.

### Basic Transformations

```javascript
// Get transformed image URL
const { data } = supabase.storage
  .from('news')
  .getPublicUrl('header.jpg', {
    transform: {
      width: 800,
      height: 600,
      resize: 'cover'
    }
  });
```

### Common Transformation Options

| Option | Description | Example |
|--------|-------------|---------|
| `width` | Target width | `800` |
| `height` | Target height | `600` |
| `resize` | Resize mode | `'cover'`, `'contain'`, `'fill'` |
| `format` | Output format | `'webp'`, `'jpeg'`, `'png'` |
| `quality` | Compression quality | `80` (1-100) |

## Common Use Cases

### Use Case 1: Teacher Profile Images

```javascript
// Upload a teacher profile image
async function uploadTeacherPhoto(file, teacherId) {
  if (!file) return null;
  
  // Create a file path with teacher ID for organization
  const filePath = `${teacherId}/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
  
  const { data, error } = await supabase.storage
    .from('teachers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
    
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('teachers')
    .getPublicUrl(filePath);
    
  return urlData.publicUrl;
}
```

### Use Case 2: News Article with Multiple Images

```javascript
// Upload multiple images for a news article
async function uploadNewsImages(files, articleId) {
  const uploadPromises = files.map(async (file, index) => {
    const filePath = `${articleId}/${index}-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    
    const { data, error } = await supabase.storage
      .from('news')
      .upload(filePath, file);
      
    if (error) throw error;
    
    return supabase.storage
      .from('news')
      .getPublicUrl(filePath).data.publicUrl;
  });
  
  return Promise.all(uploadPromises);
}
```

### Use Case 3: Serving Protected Documents

```javascript
// Generate a temporary access URL for authorized users
async function getProtectedDocument(documentPath, userId) {
  // Verify user authorization in your application logic
  if (!isAuthorized(userId)) {
    throw new Error('Not authorized');
  }
  
  // Create a short-lived signed URL
  const { data, error } = await supabase.storage
    .from('protected-documents')
    .createSignedUrl(documentPath, 300); // 5 minutes
    
  if (error) throw error;
  
  return data.signedUrl;
}
```

## Limitations & Considerations

1. **File Size Limits**:
   - Free Tier: 50MB per file
   - Paid Tiers: Up to 50GB per file

2. **Folder Simulation**:
   - Folders are not actual filesystem objects
   - Deleting "folders" requires deleting all files within that path prefix

3. **Bucket Restrictions**:
   - Bucket names must be unique within your project
   - Names can only contain lowercase letters, numbers, and hyphens

4. **Performance Considerations**:
   - Use the CDN for optimal delivery
   - Use image transformations to resize large images
   - Consider implementing lazy loading for media-heavy pages

5. **Security Practices**:
   - Always validate file uploads on the server
   - Implement least privilege access control
   - Use RLS policies for fine-grained permissions

## Troubleshooting

### Common Issues and Solutions

1. **Upload Errors**:
   - Check file size limits
   - Verify authentication status
   - Ensure bucket exists

2. **Access Denied**:
   - Confirm bucket privacy settings
   - Verify RLS policies
   - Check token expiration for signed URLs

3. **Missing Files**:
   - Files might be in different buckets
   - Check path formatting (slashes, case sensitivity)

4. **Slow Performance**:
   - Large files should use resumable uploads
   - Consider image optimization
   - Check CDN configuration

### Debugging Tools

1. **Supabase Dashboard**:
   - Use the Storage section to browse files
   - Check access logs
   - Review bucket configurations

2. **Console Logging**:
   - Log upload/download operations
   - Track error responses
   - Monitor performance metrics

---

## Additional Resources

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/storage-createbucket)
- [Supabase Storage GitHub Repository](https://github.com/supabase/storage-api) 