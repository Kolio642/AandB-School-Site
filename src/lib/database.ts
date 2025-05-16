/**
 * Database types for the Supabase database tables
 */
import { supabase } from './supabase';

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

export interface News {
  id: string;
  created_at: string;
  updated_at: string;
  title_en: string;
  title_bg: string;
  summary_en: string;
  summary_bg: string;
  content_en: string;
  content_bg: string;
  date: string;
  image: string | null;
  published: boolean;
}

export interface Achievement {
  id: string;
  created_at: string;
  updated_at: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  date: string;
  image: string | null;
  student_name: string | null;
  category: string;
  published: boolean;
}

export interface Course {
  id: string;
  created_at: string;
  updated_at: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  image: string | null;
  category: string;
  published: boolean;
  sort_order: number;
}

/**
 * Fetch teachers from the database
 * @param publishedOnly - If true, only fetch published teachers
 * @returns Array of Teacher objects
 */
export async function getTeachers(publishedOnly: boolean = false) {
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
    return [];
  }
  
  return data || [];
} 