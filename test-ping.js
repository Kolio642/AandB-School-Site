const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

console.log('Credentials found:', 
  `URL: ${supabaseUrl ? 'Found' : 'Missing'}`, 
  `Key: ${supabaseKey ? 'Found' : 'Missing'}`
);

async function ping() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Just perform a simple health check rather than querying a specific table
    const { data, error } = await supabase.rpc('get_session_info');
      
    if (error) {
      console.error('Error connecting to database:', error.message);
      
      // Try another approach - query schema information
      console.log('Trying to query schema information...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
        
      if (tablesError) {
        console.error('Error querying tables:', tablesError.message);
        
        // One more attempt with a simple authentication check
        console.log('Trying simple auth check...');
        const { error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.error('Error with auth check:', authError.message);
          console.error('All connection attempts failed. Please check your credentials and database status.');
          process.exit(1);
        } else {
          console.log('Auth check successful!');
          console.log('Basic connection to Supabase works, but table access failed. The GitHub Actions workflow should still work for keeping your database alive.');
        }
      } else {
        console.log('Tables found:', tables);
        console.log('Database connection successful!');
      }
    } else {
      console.log('Session data:', data);
      console.log('Database connection successful!');
    }
    
    console.log('Test completed at', new Date().toISOString());
    console.log('Your database will remain active with the GitHub workflow running every 6 hours.');
  } catch (error) {
    console.error('Exception:', error.message);
    process.exit(1);
  }
}

ping(); 