/**
 * Comprehensive script to set up all required Supabase storage buckets
 * and configure proper access permissions
 * 
 * Run with: pnpm run setup-storage
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
const dotenvPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
  console.log('Loaded environment variables from .env.local');
} else {
  console.warn('Warning: .env.local file not found, using process.env variables');
  require('dotenv').config();
}

// Required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure the following are set in your .env.local file:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Creates a storage bucket if it doesn't exist
 */
async function createBucket(bucketName, options = { public: true }) {
  console.log(`Creating ${bucketName} bucket...`);
  
  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: options.public,
    fileSizeLimit: options.fileSizeLimit || 10 * 1024 * 1024, // Default 10MB limit
    allowedMimeTypes: options.allowedMimeTypes,
  });
  
  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`✓ Bucket '${bucketName}' already exists, continuing...`);
      return true;
    } else {
      console.error(`❌ Error creating bucket '${bucketName}':`, error.message);
      return false;
    }
  } else {
    console.log(`✓ Bucket '${bucketName}' created successfully`);
    return true;
  }
}

/**
 * Creates folder structure within a bucket
 */
async function createFolders(bucketName, folders) {
  console.log(`Setting up folder structure in ${bucketName} bucket...`);
  
  for (const folder of folders) {
    try {
      // Upload an empty file to create the folder (Supabase storage uses object keys for folders)
      const { error } = await supabase.storage
        .from(bucketName)
        .upload(`${folder}/.keep`, new Uint8Array(0), {
          contentType: 'text/plain',
        });
      
      if (error && !error.message.includes('already exists')) {
        console.error(`❌ Error creating folder '${folder}':`, error.message);
      } else {
        console.log(`✓ Folder '${folder}' verified`);
      }
    } catch (err) {
      console.error(`❌ Unexpected error creating folder '${folder}':`, err.message);
    }
  }
}

/**
 * Sets up security policies for a bucket
 */
async function setupBucketPolicies(bucketName) {
  console.log(`Setting up security policies for ${bucketName} bucket...`);
  
  try {
    // Run a Postgres function to set up security policies
    const { error } = await supabase.rpc('setup_storage_security', { 
      bucket_id: bucketName 
    });
    
    if (error) {
      console.log(`ℹ️ Policy setup via RPC failed, attempting direct SQL setup...`);
      await setupPoliciesWithSQL(bucketName);
    } else {
      console.log(`✓ Security policies for '${bucketName}' set up successfully`);
    }
  } catch (err) {
    console.error(`⚠️ Using fallback method for '${bucketName}' policies...`);
    await setupPoliciesWithSQL(bucketName);
  }
}

/**
 * Sets up security policies via direct SQL
 */
async function setupPoliciesWithSQL(bucketName) {
  try {
    // Create the SQL stored function if it doesn't exist
    const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION create_storage_policy(
      bucket_name TEXT,
      policy_name TEXT,
      policy_definition TEXT,
      operation TEXT DEFAULT 'SELECT'
    ) RETURNS VOID AS $$
    DECLARE
      policy_exists BOOLEAN;
    BEGIN
      -- Check if the policy already exists
      SELECT EXISTS (
        SELECT 1 FROM storage.policies 
        WHERE name = policy_name AND bucket_id = bucket_name
      ) INTO policy_exists;
      
      -- If it doesn't exist, create it
      IF NOT policy_exists THEN
        INSERT INTO storage.policies (name, definition, bucket_id, operation)
        VALUES (policy_name, policy_definition, bucket_name, operation);
      END IF;
    END;
    $$ LANGUAGE plpgsql;
    `;
    
    await supabase.rpc('admin_query', { query: createFunctionSQL }).catch(() => {
      console.warn(`⚠️ Couldn't create helper function. This is normal if you don't have admin_query RPC set up.`);
    });
    
    // Direct SQL execution to create policies for the bucket
    const sqlQueries = [
      // Allow public read access
      `DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM storage.policies 
          WHERE name = 'Public Read Access for ${bucketName}' AND bucket_id = '${bucketName}'
        ) THEN
          INSERT INTO storage.policies (name, definition, bucket_id)
          VALUES (
            'Public Read Access for ${bucketName}',
            '(bucket_id = ''${bucketName}'')',
            '${bucketName}'
          );
        END IF;
      END $$;`,
      
      // Allow authenticated users to upload
      `DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM storage.policies 
          WHERE name = 'Auth Users can upload to ${bucketName}' AND bucket_id = '${bucketName}'
        ) THEN
          INSERT INTO storage.policies (name, definition, bucket_id, operation)
          VALUES (
            'Auth Users can upload to ${bucketName}',
            '(bucket_id = ''${bucketName}'' AND auth.role() = ''authenticated'')',
            '${bucketName}',
            'INSERT'
          );
        END IF;
      END $$;`,
      
      // Allow authenticated users to update
      `DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM storage.policies 
          WHERE name = 'Auth Users can update in ${bucketName}' AND bucket_id = '${bucketName}'
        ) THEN
          INSERT INTO storage.policies (name, definition, bucket_id, operation)
          VALUES (
            'Auth Users can update in ${bucketName}',
            '(bucket_id = ''${bucketName}'' AND auth.role() = ''authenticated'')',
            '${bucketName}',
            'UPDATE'
          );
        END IF;
      END $$;`,
      
      // Allow authenticated users to delete
      `DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM storage.policies 
          WHERE name = 'Auth Users can delete from ${bucketName}' AND bucket_id = '${bucketName}'
        ) THEN
          INSERT INTO storage.policies (name, definition, bucket_id, operation)
          VALUES (
            'Auth Users can delete from ${bucketName}',
            '(bucket_id = ''${bucketName}'' AND auth.role() = ''authenticated'')',
            '${bucketName}',
            'DELETE'
          );
        END IF;
      END $$;`
    ];
    
    // Try each SQL query
    for (const sql of sqlQueries) {
      try {
        await supabase.rpc('admin_query', { query: sql }).catch(() => {
          // Suppress errors if the RPC doesn't exist
        });
      } catch (err) {
        console.warn(`⚠️ Couldn't execute policy SQL for ${bucketName}. You may need to set policies manually.`);
      }
    }
    
    console.log(`ℹ️ Security policy setup attempted for '${bucketName}'. Check the Supabase dashboard to verify.`);
    console.log(`   If policies weren't created, you'll need to create them manually in the dashboard.`);
  } catch (err) {
    console.error(`❌ Error setting up policies via SQL for '${bucketName}':`, err.message);
  }
}

/**
 * Creates a helper function in Supabase for setting up security
 */
async function createHelperFunction() {
  console.log('Setting up helper functions for storage security...');
  
  try {
    // Create a custom function to set up bucket policies
    const { error } = await supabase.rpc('admin_query', {
      query: `
      CREATE OR REPLACE FUNCTION setup_storage_security(bucket_id TEXT)
      RETURNS VOID AS $$
      BEGIN
        -- Enable RLS on storage.objects if not already enabled
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for the bucket if they don't exist
        
        -- Allow public read access
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage' 
          AND policyname = 'Public Read Access ' || bucket_id
        ) THEN
          CREATE POLICY "Public Read Access " || bucket_id
            ON storage.objects FOR SELECT
            USING (bucket_id = $1);
        END IF;
        
        -- Allow authenticated users to upload
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage' 
          AND policyname = 'Auth Users Upload ' || bucket_id
        ) THEN
          CREATE POLICY "Auth Users Upload " || bucket_id
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = $1 AND auth.role() = 'authenticated');
        END IF;
        
        -- Allow authenticated users to update
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage' 
          AND policyname = 'Auth Users Update ' || bucket_id
        ) THEN
          CREATE POLICY "Auth Users Update " || bucket_id
            ON storage.objects FOR UPDATE
            USING (bucket_id = $1 AND auth.role() = 'authenticated');
        END IF;
        
        -- Allow authenticated users to delete
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies 
          WHERE tablename = 'objects' 
          AND schemaname = 'storage' 
          AND policyname = 'Auth Users Delete ' || bucket_id
        ) THEN
          CREATE POLICY "Auth Users Delete " || bucket_id
            ON storage.objects FOR DELETE
            USING (bucket_id = $1 AND auth.role() = 'authenticated');
        END IF;
      END;
      $$ LANGUAGE plpgsql;
      `
    });
    
    if (error) {
      console.warn(`⚠️ Could not create helper function: ${error.message}`);
      console.warn('This is expected if you don\'t have admin_query RPC set up.');
      return false;
    }
    
    return true;
  } catch (err) {
    console.warn('⚠️ Could not create helper function. This is normal if you don\'t have admin privileges.');
    return false;
  }
}

/**
 * Main setup function
 */
async function setupStorage() {
  console.log('=== A&B School Website Storage Setup ===');
  console.log(`Using Supabase project: ${supabaseUrl}`);
  
  // Define bucket configurations
  const buckets = [
    {
      name: 'teachers',
      options: {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB for teacher images
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      },
      folders: []
    },
    {
      name: 'news',
      options: {
        public: true,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      },
      folders: []
    },
    {
      name: 'achievements',
      options: {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024, // 20MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      },
      folders: [
        'certificates',
        'awards',
        'competitions',
        'academic'
      ]
    },
    {
      name: 'courses',
      options: {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024, // 20MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
      },
      folders: []
    }
  ];
  
  // Try to create helper function
  await createHelperFunction();
  
  // Create all buckets
  console.log('\n1. Creating storage buckets:');
  for (const bucket of buckets) {
    const success = await createBucket(bucket.name, bucket.options);
    if (success && bucket.folders.length > 0) {
      await createFolders(bucket.name, bucket.folders);
    }
  }
  
  // Set up security policies for all buckets
  console.log('\n2. Setting up security policies:');
  for (const bucket of buckets) {
    await setupBucketPolicies(bucket.name);
  }
  
  console.log('\n=== Storage Setup Complete! ===');
  console.log('All buckets have been created with the following configurations:');
  console.log('- Public read access for all users');
  console.log('- Write access (create/update/delete) restricted to authenticated users only');
  console.log('\nYou can now use the following buckets in your application:');
  for (const bucket of buckets) {
    console.log(`- ${bucket.name}${bucket.folders.length > 0 ? ' (with folders)' : ''}`);
  }
  
  console.log('\n⚠️ Important: If policy creation failed, please set up these policies manually in the Supabase dashboard:');
  console.log('1. Enable RLS on storage.objects table');
  console.log('2. Create policies for each bucket to allow:');
  console.log('   - Public SELECT access');
  console.log('   - Authenticated users only for INSERT, UPDATE, DELETE');
}

// Run the setup
setupStorage().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
}); 