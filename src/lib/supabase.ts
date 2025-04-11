// This file provides legacy support for components using the old supabase import
// New components should import from @supabase/ssr directly
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

// Custom fetch function with better error handling and caching
const customFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  return fetch(input, {
    ...init,
    mode: 'cors',
    cache: init?.method === 'GET' ? 'force-cache' : 'no-cache',
  }).catch(error => {
    console.error('Fetch error:', error);
    throw error;
  });
};

// Simple in-memory cache for responses
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map<string, { data: any; timestamp: number }>();

// Create the Supabase client with options
// Note: Most client components should use createBrowserClient from @supabase/ssr
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    // Use custom fetch with caching for GET requests
    fetch: customFetch
  }
});

// Create a service role client for admin operations (server-side only)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    })
  : null;

/**
 * Check if the service role client is available
 */
export function hasServiceRole(): boolean {
  return !!supabaseAdmin;
}

/**
 * Cached fetch function for Supabase data
 * Use this for frequently accessed data that doesn't change often
 */
export async function cachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = responseCache.get(cacheKey);
  
  // Return cached data if it exists and hasn't expired
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  // Fetch fresh data
  const data = await fetchFn();
  
  // Cache the new data
  responseCache.set(cacheKey, { data, timestamp: now });
  
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