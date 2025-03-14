-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create news table
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title_en TEXT NOT NULL,
  title_bg TEXT NOT NULL,
  summary_en TEXT NOT NULL,
  summary_bg TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_bg TEXT NOT NULL,
  date DATE NOT NULL,
  image TEXT NOT NULL,
  published BOOLEAN DEFAULT false NOT NULL
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  title_en TEXT NOT NULL,
  title_bg TEXT NOT NULL,
  description_en TEXT NOT NULL,
  description_bg TEXT NOT NULL,
  date DATE NOT NULL,
  image TEXT,
  student_name TEXT,
  category TEXT NOT NULL,
  published BOOLEAN DEFAULT false NOT NULL
);

-- Enable Row Level Security on tables
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for news table
-- Allow anyone to read published news
CREATE POLICY "Allow public read access to published news" 
  ON public.news 
  FOR SELECT 
  USING (published = true);

-- Allow authenticated users to read all news
CREATE POLICY "Allow authenticated users to read all news" 
  ON public.news 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to insert news
CREATE POLICY "Allow authenticated users to insert news" 
  ON public.news 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow authenticated users to update news
CREATE POLICY "Allow authenticated users to update news" 
  ON public.news 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Allow authenticated users to delete news
CREATE POLICY "Allow authenticated users to delete news" 
  ON public.news 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create policies for achievements table
-- Allow anyone to read published achievements
CREATE POLICY "Allow public read access to published achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (published = true);

-- Allow authenticated users to read all achievements
CREATE POLICY "Allow authenticated users to read all achievements" 
  ON public.achievements 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to insert achievements
CREATE POLICY "Allow authenticated users to insert achievements" 
  ON public.achievements 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow authenticated users to update achievements
CREATE POLICY "Allow authenticated users to update achievements" 
  ON public.achievements 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Allow authenticated users to delete achievements
CREATE POLICY "Allow authenticated users to delete achievements" 
  ON public.achievements 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS news_date_idx ON public.news (date DESC);
CREATE INDEX IF NOT EXISTS news_published_idx ON public.news (published);
CREATE INDEX IF NOT EXISTS achievements_date_idx ON public.achievements (date DESC);
CREATE INDEX IF NOT EXISTS achievements_category_idx ON public.achievements (category);
CREATE INDEX IF NOT EXISTS achievements_published_idx ON public.achievements (published); 