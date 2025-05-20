-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title_en TEXT NOT NULL,
  title_bg TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_bg TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  published BOOLEAN DEFAULT false NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses table
-- Allow anyone to read published courses
CREATE POLICY "Allow public read access to published courses" 
  ON public.courses 
  FOR SELECT 
  USING (published = true);

-- Allow authenticated users to read all courses
CREATE POLICY "Allow authenticated users to read all courses" 
  ON public.courses 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to insert courses
CREATE POLICY "Allow authenticated users to insert courses" 
  ON public.courses 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow authenticated users to update courses
CREATE POLICY "Allow authenticated users to update courses" 
  ON public.courses 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Allow authenticated users to delete courses
CREATE POLICY "Allow authenticated users to delete courses" 
  ON public.courses 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS courses_category_idx ON public.courses (category);
CREATE INDEX IF NOT EXISTS courses_sort_order_idx ON public.courses (sort_order);
CREATE INDEX IF NOT EXISTS courses_published_idx ON public.courses (published); 