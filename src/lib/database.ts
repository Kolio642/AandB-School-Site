import { supabase, supabaseAdmin, handleSupabaseError } from './supabase';
import { Database } from '@/types/supabase';
import { Locale } from './i18n';

/**
 * Type for news items from database
 */
export type NewsItem = Database['public']['Tables']['news']['Row'];

/**
 * Type for achievement items from database
 */
export type Achievement = Database['public']['Tables']['achievements']['Row'];

/**
 * Type for teacher items from database
 */
export type Teacher = Database['public']['Tables']['teachers']['Row'];

/**
 * Type for course items from database
 */
export type Course = Database['public']['Tables']['courses']['Row'];

/**
 * Generic type for paginated results
 */
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Fetch paginated news items
 */
export async function getNews(
  page = 1, 
  pageSize = 10, 
  locale: Locale = 'en',
  onlyPublished = true,
  useAdmin = false
): Promise<PaginatedResult<NewsItem>> {
  try {
    // Choose the appropriate client based on if we need to bypass RLS
    const client = (useAdmin && supabaseAdmin) || (!onlyPublished && supabaseAdmin) 
      ? supabaseAdmin 
      : supabase;
    
    let query = client
      .from('news')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false });
    
    if (onlyPublished) {
      query = query.eq('published', true);
    }
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .range(from, to);
      
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > (page * pageSize)
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}

/**
 * Fetch a single news item by ID
 */
export async function getNewsById(id: string, onlyPublished = true): Promise<NewsItem | null> {
  try {
    // If we need to fetch unpublished items, we should use the admin client if available
    const client = (!onlyPublished && supabaseAdmin) ? supabaseAdmin : supabase;
    
    let query = client
      .from('news')
      .select('*')
      .eq('id', id);
    
    if (onlyPublished) {
      query = query.eq('published', true);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found - not really an error
        return null;
      }
      throw new Error(handleSupabaseError(error));
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching news item with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch paginated achievements
 */
export async function getAchievements(
  page = 1, 
  pageSize = 10,
  category?: string,
  locale: Locale = 'en',
  onlyPublished = true,
  useAdmin = false
): Promise<PaginatedResult<Achievement>> {
  try {
    // Choose the appropriate client based on if we need to bypass RLS
    const client = (useAdmin && supabaseAdmin) || (!onlyPublished && supabaseAdmin) 
      ? supabaseAdmin 
      : supabase;
    
    let query = client
      .from('achievements')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false });
    
    if (onlyPublished) {
      query = query.eq('published', true);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, error, count } = await query
      .range(from, to);
      
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return {
      data: data || [],
      count: count || 0,
      page,
      pageSize,
      hasMore: (count || 0) > (page * pageSize)
    };
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
}

/**
 * Fetch a single achievement by ID
 */
export async function getAchievementById(id: string, onlyPublished = true): Promise<Achievement | null> {
  try {
    // If we need to fetch unpublished items, we should use the admin client if available
    const client = (!onlyPublished && supabaseAdmin) ? supabaseAdmin : supabase;
    
    let query = client
      .from('achievements')
      .select('*')
      .eq('id', id);
    
    if (onlyPublished) {
      query = query.eq('published', true);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      throw new Error(handleSupabaseError(error));
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching achievement with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Fetch teachers
 */
export async function getTeachers(onlyPublished = true, useAdmin = false): Promise<Teacher[]> {
  try {
    // Choose the appropriate client based on if we need to bypass RLS
    const client = (useAdmin && supabaseAdmin) || (!onlyPublished && supabaseAdmin) 
      ? supabaseAdmin 
      : supabase;
    
    let query = client
      .from('teachers')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (onlyPublished) {
      query = query.eq('published', true);
    }
    
    const { data, error } = await query;
      
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
}

/**
 * Fetch courses with optional category filter
 */
export async function getCourses(category?: string, onlyPublished = true, useAdmin = false): Promise<Course[]> {
  try {
    // Choose the appropriate client based on if we need to bypass RLS
    const client = (useAdmin && supabaseAdmin) || (!onlyPublished && supabaseAdmin) 
      ? supabaseAdmin 
      : supabase;
    
    let query = client
      .from('courses')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (onlyPublished) {
      query = query.eq('published', true);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
      
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
}

/**
 * Create a new news item
 */
export async function createNewsItem(newsItem: Database['public']['Tables']['news']['Insert'], useAdmin = false) {
  try {
    const client = useAdmin && supabaseAdmin ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('news')
      .insert(newsItem)
      .select()
      .single();
    
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return data;
  } catch (error) {
    console.error('Error creating news item:', error);
    throw error;
  }
}

/**
 * Update an existing news item
 */
export async function updateNewsItem(
  id: string, 
  updates: Database['public']['Tables']['news']['Update'],
  useAdmin = false
) {
  try {
    const client = useAdmin && supabaseAdmin ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('news')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return data;
  } catch (error) {
    console.error(`Error updating news item with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a news item
 */
export async function deleteNewsItem(id: string, useAdmin = false) {
  try {
    const client = useAdmin && supabaseAdmin ? supabaseAdmin : supabase;
    
    const { error } = await client
      .from('news')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting news item with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Create a new achievement
 */
export async function createAchievement(
  achievement: Database['public']['Tables']['achievements']['Insert'],
  useAdmin = false
) {
  try {
    const client = useAdmin && supabaseAdmin ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('achievements')
      .insert(achievement)
      .select()
      .single();
    
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return data;
  } catch (error) {
    console.error('Error creating achievement:', error);
    throw error;
  }
}

/**
 * Update an existing achievement
 */
export async function updateAchievement(
  id: string, 
  updates: Database['public']['Tables']['achievements']['Update'],
  useAdmin = false
) {
  try {
    const client = useAdmin && supabaseAdmin ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('achievements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return data;
  } catch (error) {
    console.error(`Error updating achievement with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete an achievement
 */
export async function deleteAchievement(id: string, useAdmin = false) {
  try {
    const client = useAdmin && supabaseAdmin ? supabaseAdmin : supabase;
    
    const { error } = await client
      .from('achievements')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(handleSupabaseError(error));
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting achievement with ID ${id}:`, error);
    throw error;
  }
} 