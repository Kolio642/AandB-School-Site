import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const session = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session.data.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: JPG, PNG, WebP, GIF' 
      }, { status: 400 });
    }
    
    // Make sure we have a courses bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('courses');
    
    // If bucket doesn't exist, create it
    if (bucketError && bucketError.message.includes('not found')) {
      await supabase.storage.createBucket('courses', {
        public: true,
        fileSizeLimit: 5242880, // 5MB limit
        allowedMimeTypes: allowedTypes
      });
    }
    
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('courses')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('courses')
      .getPublicUrl(data.path);
    
    return NextResponse.json({
      fileName: data.path,
      publicUrl: urlData.publicUrl
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 