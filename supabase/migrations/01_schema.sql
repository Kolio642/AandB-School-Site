-- Create schema for news and achievements
BEGIN;

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- News table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  image_url VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_news_slug ON news(slug);

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

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_achievements_date ON achievements(date);

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

COMMIT; 