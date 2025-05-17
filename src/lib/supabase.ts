// This file provides legacy support for components using the old supabase import
// New components should import from @supabase/supabase-js directly
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

// In-memory cache for storing query results
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Executes and caches a fetch operation with a specified cache key
 * @param cacheKey Unique identifier for the cache entry
 * @param fetchFn Async function to execute if cache miss
 * @returns The cached or freshly fetched data
 */
export async function cachedFetch<T>(
  cacheKey: string, 
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cachedItem = cache.get(cacheKey);
  
  // Return cached result if valid and not expired
  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    return cachedItem.data;
  }
  
  // Execute fetch function
  const data = await fetchFn();
  
  // Store in cache
  cache.set(cacheKey, { data, timestamp: now });
  
  return data;
}

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