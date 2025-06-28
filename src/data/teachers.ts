import { supabase, cachedFetch } from '@/lib/supabase';
import { Locale } from '@/lib/i18n';

// Define the interface for the Teacher object
export interface Teacher {
  id: string;
  name: string;
  image?: string;
  email?: string;
  translations: {
    [key in Locale]: {
      title: string;
      bio: string;
    }
  };
  sort_order: number;
}

// Define the interface for Supabase Teacher object
export interface SupabaseTeacher {
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

// Static fallback teacher data
const staticTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Petar Georgiev',
    image: '/images/teacher-1.jpg',
    email: 'petar@example.com',
    translations: {
      en: {
        title: 'Mathematics Teacher',
        bio: 'Experienced mathematics teacher with over 15 years of experience teaching at high school and olympiad level.'
      },
      bg: {
        title: 'Учител по математика',
        bio: 'Опитен учител по математика с над 15 години опит в преподаването на гимназиално и олимпийско ниво.'
      }
    },
    sort_order: 1
  },
  {
    id: '2',
    name: 'Maria Ivanova',
    image: '/images/teacher-2.jpg',
    email: 'maria@example.com',
    translations: {
      en: {
        title: 'Informatics Teacher',
        bio: 'Computer science expert specializing in algorithms and competitive programming. Has led teams to multiple national victories.'
      },
      bg: {
        title: 'Учител по информатика',
        bio: 'Експерт по компютърни науки, специализиран в алгоритми и състезателно програмиране. Водил е отбори до множество национални победи.'
      }
    },
    sort_order: 2
  }
];

/**
 * Converts a Supabase teacher to the frontend Teacher format
 */
function mapSupabaseToTeacher(item: SupabaseTeacher): Teacher {
  return {
    id: item.id,
    name: item.name,
    image: item.image || undefined,
    email: item.email || undefined,
    translations: {
      en: {
        title: item.title_en,
        bio: item.bio_en
      },
      bg: {
        title: item.title_bg,
        bio: item.bio_bg
      }
    },
    sort_order: item.sort_order
  };
}

/**
 * Fetch all teachers from the database, with option to filter by published status
 * Returns a consistent interface with fallback to static data if necessary
 */
export async function getAllTeachers(publishedOnly: boolean = true): Promise<Teacher[]> {
  try {
    return await cachedFetch(`teachers_${publishedOnly ? 'published' : 'all'}`, async () => {
      // Try fetching from Supabase first
      if (supabase) {
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
            console.error('Error fetching teachers from Supabase:', error);
          } else if (data && data.length > 0) {
            console.log(`Successfully fetched ${data.length} teachers from Supabase`);
            return data.map(mapSupabaseToTeacher);
          }
        } catch (supabaseError) {
          console.error("Exception during Supabase teachers fetch:", supabaseError);
        }
      }
      
      // Fallback to static data
      console.log("Falling back to static teacher data");
      return staticTeachers;
    });
  } catch (error) {
    console.error("Error in getAllTeachers:", error);
    // Ultimate fallback to static data
    return staticTeachers;
  }
}

/**
 * Get a teacher by ID
 */
export async function getTeacherById(id: string): Promise<Teacher | undefined> {
  try {
    return await cachedFetch(`teacher_${id}`, async () => {
      // Try to fetch from Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('id', id)
            .eq('published', true)
            .single();
          
          if (error) {
            console.error('Error fetching teacher by ID from Supabase:', error);
          } else if (data) {
            console.log(`Found teacher by ID: ${id}`);
            return mapSupabaseToTeacher(data);
          }
        } catch (supabaseError) {
          console.error("Exception during Supabase teacher fetch by ID:", supabaseError);
        }
      }
      
      // Check static data as fallback
      console.log(`Checking static teachers for ID: ${id}`);
      return staticTeachers.find(teacher => teacher.id === id);
    });
  } catch (error) {
    console.error("Error in getTeacherById:", error);
    // Fallback to static data
    return staticTeachers.find(teacher => teacher.id === id);
  }
} 