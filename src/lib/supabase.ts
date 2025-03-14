import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Check if environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Custom fetch function with better error handling
const customFetch = (url: string, options: RequestInit) => {
  return fetch(url, {
    ...options,
    mode: 'cors',
    cache: 'no-cache',
  }).catch(error => {
    console.error('Fetch error:', error);
    throw error;
  });
};

// Create the Supabase client with options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Disable setting custom fetch to avoid type errors
    // fetch: customFetch
  }
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  console.error('Supabase error:', error);
  
  if (typeof error === 'object' && error !== null) {
    if (error.message) return error.message;
    if (error.error_description) return error.error_description;
    if (error.details) return error.details;
  }
  
  return 'An unexpected error occurred';
} 