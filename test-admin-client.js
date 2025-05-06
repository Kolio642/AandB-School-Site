// Simple test script to verify supabaseAdmin client functionality
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key available:', !!supabaseServiceKey);

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test function
async function testAdminAccess() {
  try {
    console.log('Testing admin client permissions...');
    
    // Test RLS bypass by attempting to read from a table
    const { data: teachersData, error: readError } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .limit(1);
      
    if (readError) {
      console.error('Error reading data:', readError);
    } else {
      console.log('Successfully read data with admin client:', teachersData);
    }
    
    // Create a test record
    console.log('Creating test record...');
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('teachers')
      .insert({
        name: 'Test Teacher (Delete Me)',
        title_en: 'Test Title EN',
        title_bg: 'Test Title BG',
        bio_en: 'Test bio English',
        bio_bg: 'Test bio Bulgarian',
        published: false,
        sort_order: 999
      })
      .select();
      
    if (insertError) {
      console.error('Error inserting test record:', insertError);
      return;
    }
    
    console.log('Test record created:', insertData);
    
    if (!insertData || insertData.length === 0) {
      console.error('No record ID returned, cannot proceed with delete test');
      return;
    }
    
    const testId = insertData[0].id;
    
    // Test delete operation
    console.log(`Attempting to delete test record with ID: ${testId}`);
    const { error: deleteError } = await supabaseAdmin
      .from('teachers')
      .delete()
      .eq('id', testId);
      
    if (deleteError) {
      console.error('Error deleting test record:', deleteError);
    } else {
      console.log('Successfully deleted test record!');
    }
    
  } catch (error) {
    console.error('Unexpected error during test:', error);
  }
}

// Run test
testAdminAccess()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Test failed:', err)); 