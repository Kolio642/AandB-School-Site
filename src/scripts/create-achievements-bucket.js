/**
 * Script to create the 'achievements' bucket in Supabase with appropriate folders
 * 
 * Run with: node src/scripts/create-achievements-bucket.js
 */

const { createClient } = require('@supabase/supabase-js');

// Get environment variables from .env file if using dotenv
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  console.log('Creating achievements bucket...');
  
  const { data, error } = await supabase.storage.createBucket('achievements', {
    public: true, // Make it public so files can be accessed without authentication
    fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Achievements bucket already exists, continuing...');
    } else {
      console.error('Error creating bucket:', error.message);
      return;
    }
  } else {
    console.log('Achievements bucket created successfully');
  }

  // Create organizational folders within the bucket by adding empty placeholder files
  await createFolders();
  
  console.log('Setup complete! You can now upload files to the achievements bucket.');
}

async function createFolders() {
  const folders = ['certificates', 'awards', 'competitions', 'academic'];
  
  console.log('Creating organizational folders within achievements bucket...');
  
  for (const folder of folders) {
    const { error } = await supabase.storage
      .from('achievements')
      .upload(`${folder}/.folder`, new Uint8Array(0), {
        contentType: 'application/x-empty',
        upsert: true
      });
      
    if (error && !error.message.includes('already exists')) {
      console.error(`Error creating ${folder} folder:`, error.message);
    } else {
      console.log(`- ${folder}/ folder created or already exists`);
    }
  }
}

// Run the create bucket function
createBucket()
  .catch(err => {
    console.error('Error in create bucket script:', err);
    process.exit(1);
  }); 