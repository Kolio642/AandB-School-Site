import { Locale } from "@/lib/i18n";
import { supabase, cachedFetch } from "@/lib/supabase";

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

// Supabase news item interface
export interface SupabaseNewsItem {
  id: string;
  title: string;
  content: string;
  slug: string;
  image_url?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  published: boolean;
}

/**
 * News data store
 * This is a simple solution for a site without API capabilities
 * To add news, just add an item to this array
 */
export const newsItems: NewsItem[] = [
  {
    id: "opening-2023",
    date: "2023-09-01",
    image: "/images/hero-image.jpg",
    translations: {
      bg: {
        title: "Откриване на учебната 2023-2024 година",
        summary: "Школа А&Б открива новата учебна година с нови курсове и програми",
        content: `
          <p>С радост обявяваме официалното откриване на учебната 2023-2024 година в Школа А&Б!</p>
          
          <p>Тази година предлагаме редица нови курсове, включително разширена програма по програмиране 
          за ученици от 5-7 клас и специализирана подготовка за национални състезания по информатика.</p>
          
          <p>Заповядайте на 15 септември от 10:00 часа в централната ни школа, за да се запознаете с 
          нашите преподаватели и да научите повече за програмите ни.</p>
        `
      },
      en: {
        title: "Opening of the 2023-2024 School Year",
        summary: "School A&B opens the new school year with new courses and programs",
        content: `
          <p>We are pleased to announce the official opening of the 2023-2024 school year at School A&B!</p>
          
          <p>This year we offer a number of new courses, including an expanded programming program 
          for students in grades 5-7 and specialized preparation for national informatics competitions.</p>
          
          <p>Join us on September 15 at 10:00 AM at our central school to meet our teachers and learn more about our programs.</p>
        `
      }
    }
  },
  {
    id: "competition-results-2023",
    date: "2023-12-15",
    image: "/images/hero-image.jpg",
    translations: {
      bg: {
        title: "Отлично представяне на нашите ученици на състезанието по информатика",
        summary: "Учениците от Школа А&Б спечелиха 5 медала на националното състезание",
        content: `
          <p>С гордост съобщаваме, че учениците от Школа А&Б се представиха отлично на националното състезание по информатика!</p>
          
          <p>Нашите възпитаници спечелиха общо 5 медала - 2 златни, 1 сребърен и 2 бронзови. Това постижение 
          ни нарежда сред най-успешните школи в страната.</p>
          
          <p>Поздравления за всички участници и техните преподаватели за упоритата работа и отличното представяне!</p>
        `
      },
      en: {
        title: "Excellent performance of our students at the informatics competition",
        summary: "School A&B students won 5 medals at the national competition",
        content: `
          <p>We are proud to announce that School A&B students performed excellently at the national informatics competition!</p>
          
          <p>Our students won a total of 5 medals - 2 gold, 1 silver and 2 bronze. This achievement 
          places us among the most successful schools in the country.</p>
          
          <p>Congratulations to all participants and their teachers for their hard work and excellent performance!</p>
        `
      }
    }
  },
  {
    id: "summer-courses-2024",
    date: "2024-05-20",
    image: "/images/hero-image.jpg",
    translations: {
      bg: {
        title: "Летни курсове 2024",
        summary: "Записване за летните интензивни курсове по програмиране и математика",
        content: `
          <p>Започваме записването за летните интензивни курсове по програмиране и математика за 2024 година!</p>
          
          <p>Курсовете ще се проведат в периода 15 юни - 15 август. Предлагаме програми за различни възрастови 
          групи и нива на подготовка. Специален акцент тази година ще бъде поставен върху курса "Въведение в 
          изкуствения интелект" за ученици от 9-12 клас.</p>
          
          <p>За записване и повече информация, моля свържете се с нас на телефон 054/831008 или посетете школата.</p>
        `
      },
      en: {
        title: "Summer Courses 2024",
        summary: "Registration for summer intensive courses in programming and mathematics",
        content: `
          <p>We are starting registration for the summer intensive courses in programming and mathematics for 2024!</p>
          
          <p>The courses will take place between June 15 and August 15. We offer programs for different age 
          groups and levels of preparation. A special focus this year will be on the "Introduction to 
          Artificial Intelligence" course for students in grades 9-12.</p>
          
          <p>For registration and more information, please contact us at 054/831008 or visit the school.</p>
        `
      }
    }
  }
];

/**
 * Converts a Supabase news item to our application's NewsItem format
 */
function mapSupabaseNewsToNewsItem(item: any): NewsItem {
  return {
    id: item.id,
    date: item.date || item.created_at,
    image: item.image_url || item.image || '/images/hero-image.jpg', // Ensure fallback image
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
 * Get all news items from the data source
 * Returns data sorted by date descending (newest first)
 */
export async function getAllNews(): Promise<NewsItem[]> {
  try {
    return await cachedFetch('all_news', async () => {
      // First try from Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching news from Supabase:", error);
        } else if (data && data.length > 0) {
          return data.map(mapSupabaseNewsToNewsItem);
        }
      }
      
      // Fallback to static data if Supabase is not available or returned no results
      return [...newsItems].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    });
  } catch (error) {
    console.error("Error in getAllNews:", error);
    // Fallback to static data in case of any error
    return [...newsItems].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
}

/**
 * Get news item by ID
 */
export async function getNewsById(id: string): Promise<NewsItem | undefined> {
  try {
    return await cachedFetch(`news_${id}`, async () => {
      // First try from Supabase
      if (supabase) {
        // Try to find by slug first (preferred)
        let { data, error } = await supabase
          .from('news')
          .select('*')
          .eq('slug', id)
          .eq('published', true)
          .single();
          
        if (error) {
          // If not found by slug, try by ID
          const result = await supabase
            .from('news')
            .select('*')
            .eq('id', id)
            .eq('published', true)
            .single();
            
          if (result.error) {
            console.error("Error fetching news by ID from Supabase:", result.error);
          } else if (result.data) {
            return mapSupabaseNewsToNewsItem(result.data);
          }
        } else if (data) {
          return mapSupabaseNewsToNewsItem(data);
        }
      }
      
      // Fallback to static data
      return newsItems.find(item => item.id === id);
    });
  } catch (error) {
    console.error("Error in getNewsById:", error);
    // Fallback to static data
    return newsItems.find(item => item.id === id);
  }
}

/**
 * Get the latest news items
 * @param limit Number of items to return
 */
export async function getLatestNews(limit: number = 3): Promise<NewsItem[]> {
  try {
    return await cachedFetch(`latest_news_${limit}`, async () => {
      const allNews = await getAllNews();
      return allNews.slice(0, limit);
    });
  } catch (error) {
    console.error("Error in getLatestNews:", error);
    // Fallback to static data
    const sortedItems = [...newsItems].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return sortedItems.slice(0, limit);
  }
} 