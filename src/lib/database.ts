import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Generic database query helper with error handling
 */
export async function dbQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T> {
  const { data, error } = await queryFn();
  
  if (error) {
    console.error('Database query error:', error);
    throw new Error(error.message);
  }
  
  if (data === null) {
    throw new Error('No data returned from query');
  }
  
  return data;
}

/**
 * Execute a database transaction with proper error handling
 */
export async function dbTransaction<T>(
  transactionFn: () => Promise<T>
): Promise<T> {
  try {
    return await transactionFn();
  } catch (error) {
    console.error('Transaction error:', error);
    throw error;
  }
}

/**
 * Safely parse JSON from a database field
 */
export function parseJsonField<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON field:', error);
    return defaultValue;
  }
}

/**
 * Get current database server timestamp
 */
export async function getServerTimestamp(): Promise<string> {
  const { data, error } = await supabase
    .rpc('get_current_timestamp');
    
  if (error) throw error;
  return data;
} 