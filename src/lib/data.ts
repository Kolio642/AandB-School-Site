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
 * Get all news items from Supabase
 * Returns data sorted by date descending (newest first)
 */
export async function getAllNews(): Promise<NewsItem[]> {
  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error fetching news from Supabase:", error);
      return [];
    }
    
    return data.map(mapSupabaseNewsToNewsItem);
  } catch (error) {
    console.error("Error in getAllNews:", error);
    return [];
  }
}

/**
 * Get news item by ID
 */
export async function getNewsById(id: string): Promise<NewsItem | undefined> {
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
      return undefined;
    }
    
    return mapSupabaseNewsToNewsItem(data);
  } catch (error) {
    console.error("Error in getNewsById:", error);
    return undefined;
  }
}

/**
 * Get the latest news items
 * @param limit Number of items to return
 */
export async function getLatestNews(limit: number = 3): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error("Error fetching latest news:", error);
      return [];
    }
    
    return data.map(mapSupabaseNewsToNewsItem);
  } catch (error) {
    console.error("Error in getLatestNews:", error);
    return [];
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