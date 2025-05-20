import { Locale } from './i18n';
import { supabase } from './supabase';

// Define the NewsItem interface for frontend use
export interface NewsItem {
  id: string;
  date: string;
  image?: string;
  translations: {
    [key in Locale]: {
      title: string;
      summary: string;
      content: string;
    }
  }
}

// Define the Achievement interface for frontend use
export interface Achievement {
  id: string;
  date: string;
  image?: string;
  student_name?: string;
  category: string;
  translations: {
    [key in Locale]: {
      title: string;
      description: string;
    };
  };
}

/**
 * Converts a Supabase news item to our application's NewsItem format
 */
function mapSupabaseNewsToNewsItem(item: any): NewsItem {
  return {
    id: item.id,
    date: item.date || item.created_at,
    image: item.image,
    translations: {
      en: {
        title: item.title_en || '',
        summary: item.summary_en || '',
        content: item.content_en || ''
      },
      bg: {
        title: item.title_bg || '',
        summary: item.summary_bg || '',
        content: item.content_bg || ''
      }
    }
  };
}

/**
 * Converts a Supabase achievement to our application's Achievement format
 */
function mapSupabaseToAchievement(item: any): Achievement {
  return {
    id: item.id,
    date: item.date,
    image: item.image,
    student_name: item.student_name || undefined,
    category: item.category,
    translations: {
      en: {
        title: item.title_en,
        description: item.description_en
      },
      bg: {
        title: item.title_bg,
        description: item.description_bg
      }
    }
  };
}

/**
 * Get all news items from Supabase with pagination support
 * Returns data sorted by date descending (newest first)
 * @param page The page number (starting from 1)
 * @param pageSize The number of items per page
 */
export async function getAllNews(page?: number, pageSize?: number): Promise<{
  data: NewsItem[];
  count: number;
  error: string | null;
}> {
  try {
    // Start with the base query
    let query = supabase
      .from('news')
      .select('*', { count: 'exact' })
      .eq('published', true)
      .order('date', { ascending: false });
      
    // Apply pagination if specified
    if (page && pageSize) {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
    }
    
    // Execute the query
    const { data, error, count } = await query;
      
    if (error) {
      console.error("Error fetching news from Supabase:", error);
      return { data: [], count: 0, error: error.message };
    }
    
    // Map the results to our application's format
    const mappedData = data
      .filter(item => item) // Filter out null or undefined items
      .map(mapSupabaseNewsToNewsItem);
    
    return { 
      data: mappedData, 
      count: count || mappedData.length,
      error: null
    };
  } catch (error: any) {
    console.error("Error in getAllNews:", error);
    return { 
      data: [], 
      count: 0, 
      error: error?.message || "Failed to fetch news"
    };
  }
}

/**
 * Get news item by ID
 */
export async function getNewsById(id: string): Promise<{
  data: NewsItem | null;
  error: string | null;
}> {
  try {
    // Try to find by ID
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();
      
    if (error) {
      console.error("Error fetching news by ID from Supabase:", error);
      return { data: null, error: error.message };
    }
    
    if (!data) {
      return { data: null, error: "News item not found" };
    }
    
    return { data: mapSupabaseNewsToNewsItem(data), error: null };
  } catch (error: any) {
    console.error("Error in getNewsById:", error);
    return { 
      data: null, 
      error: error?.message || "Failed to fetch news item" 
    };
  }
}

/**
 * Get the latest news items
 * @param limit Number of items to return
 */
export async function getLatestNews(limit: number = 3): Promise<{
  data: NewsItem[];
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching latest news:", error);
      return { data: [], error: error.message };
    }
    
    // Filter out null items and map the results
    const mappedData = (data || [])
      .filter(item => item)
      .map(mapSupabaseNewsToNewsItem);
    
    return { data: mappedData, error: null };
  } catch (error: any) {
    console.error("Error in getLatestNews:", error);
    return { 
      data: [], 
      error: error?.message || "Failed to fetch latest news" 
    };
  }
}

/**
 * Get all achievements
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching achievements from Supabase:', error);
      return [];
    }
    
    return data.map(mapSupabaseToAchievement);
  } catch (error) {
    console.error('Error in getAllAchievements:', error);
    return [];
  }
}

/**
 * Get achievement by ID
 */
export async function getAchievementById(id: string): Promise<Achievement | undefined> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();
    
    if (error) {
      console.error('Error fetching achievement from Supabase:', error);
      return undefined;
    }
    
    return mapSupabaseToAchievement(data);
  } catch (error) {
    console.error('Error in getAchievementById:', error);
    return undefined;
  }
}

/**
 * Get latest achievements
 */
export async function getLatestAchievements(count: number = 5): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false })
      .limit(count);
    
    if (error) {
      console.error('Error fetching latest achievements:', error);
      return [];
    }
    
    return data.map(mapSupabaseToAchievement);
  } catch (error) {
    console.error('Error in getLatestAchievements:', error);
    return [];
  }
} 