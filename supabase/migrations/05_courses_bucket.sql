-- Add storage policies for the courses bucket
BEGIN;

-- Create courses bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'courses') THEN
        -- Insert the bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('courses', 'courses', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    END IF;
END $$;

-- Allow public access to files in the courses bucket
CREATE POLICY "Anyone can view course images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'courses');

-- Allow authenticated users to upload files to the courses bucket
CREATE POLICY "Authenticated users can upload course images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'courses');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update course images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'courses');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete course images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'courses');

-- Create achievements bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'achievements') THEN
        -- Insert the bucket
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('achievements', 'achievements', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    END IF;
END $$;

-- Allow public access to files in the achievements bucket
CREATE POLICY "Anyone can view achievement images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'achievements');

-- Allow authenticated users to upload files to the achievements bucket
CREATE POLICY "Authenticated users can upload achievement images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'achievements');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update achievement images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'achievements');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete achievement images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'achievements');

COMMIT; 