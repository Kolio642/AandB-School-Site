// This file provides legacy support for components using the old supabase import
// New components should import from @supabase/supabase-js directly
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import { cache } from 'react';

// Check if environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create the Supabase client with options
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Explicitly set storage to use cookies
    storageKey: 'sb-auth-token'
  }
});

// Create admin client with service role key if available
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: {
          'x-supabase-auth-type': 'service_role',
        },
      },
    })
  : supabase;

// Cached fetch function for data fetching
export const cachedFetch = cache(async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  
  return response.json();
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