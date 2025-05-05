/**
 * This file defines TypeScript types for the Supabase database schema.
 * You can generate these types automatically using the Supabase CLI:
 * https://supabase.com/docs/guides/api/generating-types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      news: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title_en: string
          title_bg: string
          summary_en: string
          summary_bg: string
          content_en: string
          content_bg: string
          date: string
          image: string | null
          published: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title_en: string
          title_bg: string
          summary_en: string
          summary_bg: string
          content_en: string
          content_bg: string
          date: string
          image?: string | null
          published?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title_en?: string
          title_bg?: string
          summary_en?: string
          summary_bg?: string
          content_en?: string
          content_bg?: string
          date?: string
          image?: string | null
          published?: boolean
        }
      }
      achievements: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title_en: string
          title_bg: string
          description_en: string
          description_bg: string
          date: string
          image: string | null
          student_name: string | null
          category: string
          published: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title_en: string
          title_bg: string
          description_en: string
          description_bg: string
          date: string
          image?: string | null
          student_name?: string | null
          category: string
          published?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title_en?: string
          title_bg?: string
          description_en?: string
          description_bg?: string
          date?: string
          image?: string | null
          student_name?: string | null
          category?: string
          published?: boolean
        }
      }
      teachers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          title_en: string
          title_bg: string
          bio_en: string
          bio_bg: string
          image: string | null
          email: string | null
          published: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          title_en: string
          title_bg: string
          bio_en: string
          bio_bg: string
          image?: string | null
          email?: string | null
          published?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          title_en?: string
          title_bg?: string
          bio_en?: string
          bio_bg?: string
          image?: string | null
          email?: string | null
          published?: boolean
          sort_order?: number
        }
      }
      courses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title_en: string
          title_bg: string
          description_en: string
          description_bg: string
          image: string | null
          category: string
          published: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title_en: string
          title_bg: string
          description_en: string
          description_bg: string
          image?: string | null
          category: string
          published?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title_en?: string
          title_bg?: string
          description_en?: string
          description_bg?: string
          image?: string | null
          category?: string
          published?: boolean
          sort_order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 