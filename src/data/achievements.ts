import { supabase, cachedFetch } from '@/lib/supabase';
import { Locale } from '@/lib/i18n';

// Define the structure for Supabase achievement items
export interface SupabaseAchievement {
  id: string;
  created_at: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  date: string;
  student_name: string | null;
  category: string;
  image: string | null;
  published: boolean;
}

// Define the structure for frontend achievement items
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

// Sample static achievements data
const staticAchievements: Achievement[] = [
  {
    id: '1',
    date: '2023-05-15',
    image: '/images/hero-image.jpg',
    student_name: 'Maria Ivanova',
    category: 'Math Competition',
    translations: {
      en: {
        title: 'First Place in National Mathematics Olympiad',
        description: 'Our student Maria Ivanova won first place in the National Mathematics Olympiad for high school students. This is a remarkable achievement that showcases her exceptional talent and hard work in mathematics.'
      },
      bg: {
        title: 'Първо място на Национална олимпиада по математика',
        description: 'Нашата ученичка Мария Иванова спечели първо място на Националната олимпиада по математика за гимназисти. Това е забележително постижение, което показва нейния изключителен талант и усърдна работа в областта на математиката.'
      }
    }
  },
  {
    id: '2',
    date: '2023-04-10',
    image: '/images/hero-image.jpg',
    student_name: 'Peter Stoychev',
    category: 'Informatics Competition',
    translations: {
      en: {
        title: 'Bronze Medal at International Informatics Competition',
        description: 'Our student Petar Georgiev won a bronze medal at the International Informatics Competition. This achievement demonstrates the high level of programming and algorithmic thinking taught at our school.'
      },
      bg: {
        title: 'Бронзов медал на Международно състезание по информатика',
        description: 'Нашият ученик Петър Георгиев спечели бронзов медал на Международното състезание по информатика. Това постижение демонстрира високото ниво на програмиране и алгоритмично мислене, преподавани в нашето училище.'
      }
    }
  },
  {
    id: '3',
    date: '2023-02-28',
    image: '/images/hero-image.jpg', // Adding fallback image
    category: 'School Award',
    translations: {
      en: {
        title: 'School of Excellence Award 2023',
        description: 'A&B School received the School of Excellence Award 2023 for outstanding academic results and innovative teaching methods. This award recognizes our commitment to providing top-quality education.'
      },
      bg: {
        title: 'Награда Училище с високи постижения 2023',
        description: 'Училище А&Б получи наградата Училище с високи постижения 2023 за изключителни академични резултати и иновативни методи на преподаване. Тази награда отличава нашия ангажимент да предоставяме висококачествено образование.'
      }
    }
  }
];

// Convert Supabase achievement to frontend achievement format
function mapSupabaseToAchievement(item: SupabaseAchievement): Achievement {
  return {
    id: item.id,
    date: item.date,
    image: item.image || '/images/hero-image.jpg',
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

// Get all achievements
export async function getAllAchievements(): Promise<Achievement[]> {
  try {
    return await cachedFetch('all_achievements', async () => {
      // Try to fetch from Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .order('date', { ascending: false })
            .eq('published', true);
          
          if (error) {
            console.error('Error fetching achievements from Supabase:', error);
          } else if (data && data.length > 0) {
            console.log(`Successfully fetched ${data.length} achievements from Supabase`);
            return data.map(mapSupabaseToAchievement);
          }
        } catch (supabaseError) {
          console.error("Exception during Supabase achievements fetch:", supabaseError);
        }
      }
      
      // Fallback to static data if no achievements in Supabase
      console.log("Falling back to static achievements data");
      return staticAchievements;
    });
  } catch (error) {
    console.error('Unhandled error in getAllAchievements:', error);
    // Fallback to static data for resilience
    return staticAchievements;
  }
}

// Get achievement by ID
export async function getAchievementById(id: string): Promise<Achievement | undefined> {
  try {
    return await cachedFetch(`achievement_${id}`, async () => {
      // Try to fetch from Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', id)
            .eq('published', true)
            .maybeSingle();
          
          if (error) {
            console.error('Error fetching achievement from Supabase:', error);
          } else if (data) {
            console.log(`Found achievement by ID: ${id}`);
            return mapSupabaseToAchievement(data);
          }
        } catch (supabaseError) {
          console.error("Exception during Supabase achievement fetch by ID:", supabaseError);
        }
      }
      
      // Check static achievements (for backward compatibility)
      console.log(`Checking static achievements for ID: ${id}`);
      const staticAchievement = staticAchievements.find(a => a.id === id);
      if (staticAchievement) {
        return staticAchievement;
      }
      
      return undefined;
    });
  } catch (error) {
    console.error('Error in getAchievementById:', error);
    return undefined;
  }
}

// Get achievements by category
export async function getAchievementsByCategory(category: string): Promise<Achievement[]> {
  try {
    return await cachedFetch(`achievements_category_${category}`, async () => {
      const allAchievements = await getAllAchievements();
      return allAchievements.filter(achievement => achievement.category === category);
    });
  } catch (error) {
    console.error('Error in getAchievementsByCategory:', error);
    return [];
  }
}

// Get latest achievements
export async function getLatestAchievements(count: number = 5): Promise<Achievement[]> {
  try {
    return await cachedFetch(`latest_achievements_${count}`, async () => {
      const allAchievements = await getAllAchievements();
      return allAchievements
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, count);
    });
  } catch (error) {
    console.error('Error in getLatestAchievements:', error);
    // Fallback to static data
    const sortedAchievements = [...staticAchievements].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedAchievements.slice(0, count);
  }
} 