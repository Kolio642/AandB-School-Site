// Simple script to test Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase credentials not found in .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: fetch
  }
});

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // List tables in the public schema
    console.log('\nListing tables:');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
    } else {
      console.log('Tables in public schema:', tablesData.map(t => t.table_name));
    }
    
    // Try to fetch news
    console.log('\nFetching news:');
    const { data: newsData, error: newsError } = await supabase
      .from('news')
      .select('*')
      .limit(5);
    
    if (newsError) {
      console.error('Error fetching news:', newsError);
    } else {
      console.log(`Found ${newsData.length} news items:`, newsData);
    }
    
    // Try to fetch achievements
    console.log('\nFetching achievements:');
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .limit(5);
    
    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
    } else {
      console.log(`Found ${achievementsData.length} achievements:`, achievementsData);
    }
  } catch (error) {
    console.error('Unhandled error during Supabase API connection:', error);
  }
}

testConnection(); 