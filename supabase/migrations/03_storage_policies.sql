-- Add storage policies for the teachers bucket
BEGIN;

-- Create teachers bucket if it doesn't exist
DO $$
BEGIN
    -- Check if the bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'teachers') THEN
        -- Insert the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('teachers', 'teachers', true);
    END IF;
END $$;

-- Allow public access to files in the teachers bucket
CREATE POLICY "Anyone can view teacher images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'teachers');

-- Allow authenticated users to upload files to the teachers bucket
CREATE POLICY "Authenticated users can upload teacher images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'teachers');

-- Allow authenticated users to update their own uploads
CREATE POLICY "Authenticated users can update teacher images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'teachers');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete teacher images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'teachers');

COMMIT; 