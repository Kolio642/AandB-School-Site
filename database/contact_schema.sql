-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  responded BOOLEAN DEFAULT false NOT NULL
);

-- Enable Row Level Security on table
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_messages table
-- Allow authenticated users to read all messages
CREATE POLICY "Allow authenticated users to read contact messages" 
  ON public.contact_messages 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Allow authenticated users to insert contact messages" 
  ON public.contact_messages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Allow authenticated users to update messages
CREATE POLICY "Allow authenticated users to update contact messages" 
  ON public.contact_messages 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Allow authenticated users to delete messages
CREATE POLICY "Allow authenticated users to delete contact messages" 
  ON public.contact_messages 
  FOR DELETE 
  TO authenticated 
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS contact_messages_responded_idx ON public.contact_messages (responded);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON public.contact_messages (created_at DESC); 