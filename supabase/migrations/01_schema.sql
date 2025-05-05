-- Create schema for news and achievements
BEGIN;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- News table with multilingual support
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  summary_en TEXT NOT NULL,
  summary_bg TEXT NOT NULL,
  content_en TEXT NOT NULL,
  content_bg TEXT NOT NULL,
  date DATE NOT NULL,
  image VARCHAR(255),
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_news_date ON news(date);

-- Enable row-level security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published news" 
  ON news FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can insert news" 
  ON news FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update news" 
  ON news FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Only authenticated users can delete news" 
  ON news FOR DELETE 
  TO authenticated 
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_news
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Achievements table with multilingual support
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  description_en TEXT NOT NULL,
  description_bg TEXT NOT NULL,
  date DATE NOT NULL,
  image VARCHAR(255),
  student_name VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_achievements_date ON achievements(date);
CREATE INDEX idx_achievements_category ON achievements(category);

-- Enable row-level security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published achievements" 
  ON achievements FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can insert achievements" 
  ON achievements FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update achievements" 
  ON achievements FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Only authenticated users can delete achievements" 
  ON achievements FOR DELETE 
  TO authenticated 
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER set_timestamp_achievements
BEFORE UPDATE ON achievements
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(255) NOT NULL,
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  bio_en TEXT NOT NULL,
  bio_bg TEXT NOT NULL,
  image VARCHAR(255),
  email VARCHAR(255),
  published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS on teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers
CREATE POLICY "Anyone can read published teachers" 
  ON teachers FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can modify teachers" 
  ON teachers FOR ALL 
  TO authenticated 
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER set_timestamp_teachers
BEFORE UPDATE ON teachers
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  description_en TEXT NOT NULL,
  description_bg TEXT NOT NULL,
  image VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS on courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Anyone can read published courses" 
  ON courses FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can modify courses" 
  ON courses FOR ALL 
  TO authenticated 
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER set_timestamp_courses
BEFORE UPDATE ON courses
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

COMMIT; 