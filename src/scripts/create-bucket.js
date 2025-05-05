/**
 * Script to create the 'teachers' bucket in Supabase
 * 
 * Run with: node src/scripts/create-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables from .env file if using dotenv
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  console.log('Creating teachers bucket...');
  
  const { data, error } = await supabase.storage.createBucket('teachers', {
    public: true, // Make it public so files can be accessed without authentication
    fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket already exists, continuing...');
    } else {
      console.error('Error creating bucket:', error.message);
      return;
    }
  } else {
    console.log('Bucket created successfully');
  }
  
  console.log('Setup complete! You can now upload files to the teachers bucket.');
}

createBucket().catch(console.error); 