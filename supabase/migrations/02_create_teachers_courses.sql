-- Create teachers and courses tables
BEGIN;

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