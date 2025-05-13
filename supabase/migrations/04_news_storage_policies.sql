-- Add storage policies for the news bucket
BEGIN;

-- Create news bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'news') THEN
        -- Insert the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('news', 'news', false);
    END IF;
END $$;

-- Set up RLS for news bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload news images
CREATE POLICY "Allow authenticated users to upload news images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'news');

-- Policy: Allow authenticated users to update their news images
CREATE POLICY "Allow authenticated users to update news images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'news');

-- Policy: Allow authenticated users to delete news images
CREATE POLICY "Allow authenticated users to delete news images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'news');

-- Policy: Allow everyone to view news images
CREATE POLICY "Allow everyone to view news images" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'news');

-- Create path for authenticated users to access in the news bucket
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('news', 'news', false, false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Add extension for image processing (if not exists)
CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

COMMIT; 