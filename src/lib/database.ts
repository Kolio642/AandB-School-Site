import { supabase } from './supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { cachedFetch } from './supabase';

/**
 * Teacher interface representing a teacher in the database
 */
export interface Teacher {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  title_en: string;
  title_bg: string;
  bio_en: string;
  bio_bg: string;
  image: string | null;
  email: string | null;
  published: boolean;
  sort_order: number;
}

// Fallback static teacher data in case the database is unavailable
const staticTeachers: Teacher[] = [
  {
    id: '1',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    name: 'Petar Georgiev',
    title_en: 'Mathematics Teacher',
    title_bg: 'Учител по математика',
    bio_en: 'Experienced mathematics teacher with over 15 years of experience teaching at high school and olympiad level.',
    bio_bg: 'Опитен учител по математика с над 15 години опит в преподаването на гимназиално и олимпийско ниво.',
    image: '/images/teacher-1.jpg',
    email: 'petar@example.com',
    published: true,
    sort_order: 1
  },
  {
    id: '2',
    created_at: '2023-01-02T00:00:00Z',
    updated_at: '2023-01-02T00:00:00Z',
    name: 'Maria Ivanova',
    title_en: 'Informatics Teacher',
    title_bg: 'Учител по информатика',
    bio_en: 'Computer science expert specializing in algorithms and competitive programming. Has led teams to multiple national victories.',
    bio_bg: 'Експерт по компютърни науки, специализиран в алгоритми и състезателно програмиране. Водил е отбори до множество национални победи.',
    image: '/images/teacher-2.jpg',
    email: 'maria@example.com',
    published: true,
    sort_order: 2
  }
];

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

/**
 * Get teachers from the database
 * @param publishedOnly - If true, only return published teachers
 * @returns Array of teacher objects
 */
export async function getTeachers(publishedOnly: boolean = false): Promise<Teacher[]> {
  try {
    return await cachedFetch(`teachers_${publishedOnly ? 'published' : 'all'}`, async () => {
      try {
        let query = supabase
          .from('teachers')
          .select('*')
          .order('sort_order', { ascending: true });
        
        if (publishedOnly) {
          query = query.eq('published', true);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching teachers:', error);
          // Fallback to static data
          console.log('Falling back to static teacher data');
          return staticTeachers;
        }
        
        if (data && data.length > 0) {
          console.log(`Successfully fetched ${data.length} teachers from database`);
          return data;
        }
        
        // Fallback to static data if no teachers in the database
        console.log('No teachers found in database, using static data');
        return staticTeachers;
      } catch (err) {
        console.error('Exception in teachers fetch:', err);
        // Fallback to static data in case of any error
        return staticTeachers;
      }
    });
  } catch (error) {
    console.error('Unhandled error in getTeachers:', error);
    // Fallback to static data for ultimate resilience
    return staticTeachers;
  }
} 