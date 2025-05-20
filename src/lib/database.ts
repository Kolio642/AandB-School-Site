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
 * Get mock teacher data for development
 * @returns Array of mock Teacher objects
 */
export function getMockTeachers(): Teacher[] {
  const now = new Date().toISOString();
  
  return [
    {
      id: '1',
      created_at: now,
      updated_at: now,
      name: 'Maria Ivanova',
      title_en: 'Mathematics Teacher',
      title_bg: 'Учител по математика',
      bio_en: 'Maria has over 15 years of experience teaching mathematics. She specializes in preparing students for mathematics competitions and has coached many national winners.',
      bio_bg: 'Мария има над 15 години опит в преподаването на математика. Тя се специализира в подготовката на ученици за математически състезания и е подготвила много национални победители.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      email: 'maria.ivanova@example.com',
      published: true,
      sort_order: 1
    },
    {
      id: '2',
      created_at: now,
      updated_at: now,
      name: 'Georgi Petrov',
      title_en: 'Informatics Teacher',
      title_bg: 'Учител по информатика',
      bio_en: 'Georgi has a background in software development and has been teaching programming for 10 years. He specializes in competitive programming and algorithm design.',
      bio_bg: 'Георги има опит в разработката на софтуер и преподава програмиране от 10 години. Той се специализира в състезателното програмиране и дизайна на алгоритми.',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      email: 'georgi.petrov@example.com',
      published: true,
      sort_order: 2
    },
    {
      id: '3',
      created_at: now,
      updated_at: now,
      name: 'Elena Dimitrova',
      title_en: 'Information Technology Teacher',
      title_bg: 'Учител по информационни технологии',
      bio_en: 'Elena specializes in teaching web development and design. She has worked on numerous projects and brings practical industry experience to her teaching.',
      bio_bg: 'Елена се специализира в преподаването на уеб разработка и дизайн. Тя е работила по множество проекти и внася практически опит от индустрията в своето преподаване.',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      email: 'elena.dimitrova@example.com',
      published: true,
      sort_order: 3
    },
    {
      id: '4',
      created_at: now,
      updated_at: now,
      name: 'Nikolay Todorov',
      title_en: 'Junior Mathematics Teacher',
      title_bg: 'Младши учител по математика',
      bio_en: 'Nikolay specializes in teaching mathematics to younger students. He makes complex concepts understandable and enjoyable for children.',
      bio_bg: 'Николай се специализира в преподаването на математика на по-млади ученици. Той прави сложните концепции разбираеми и интересни за децата.',
      image: 'https://randomuser.me/api/portraits/men/67.jpg',
      email: 'nikolay.todorov@example.com',
      published: true,
      sort_order: 4
    },
    {
      id: '5',
      created_at: now,
      updated_at: now,
      name: 'Silvia Angelova',
      title_en: 'Robotics Instructor',
      title_bg: 'Инструктор по роботика',
      bio_en: 'Silvia leads our robotics program, combining programming with hardware engineering. Her students regularly participate in international robotics competitions.',
      bio_bg: 'Силвия ръководи нашата програма по роботика, комбинирайки програмиране с хардуерно инженерство. Нейните ученици редовно участват в международни състезания по роботика.',
      image: 'https://randomuser.me/api/portraits/women/22.jpg',
      email: 'silvia.angelova@example.com',
      published: true,
      sort_order: 5
    },
    {
      id: '6',
      created_at: now,
      updated_at: now,
      name: 'Martin Kolev',
      title_en: 'Competitive Programming Coach',
      title_bg: 'Треньор по състезателно програмиране',
      bio_en: 'Martin is a former national olympiad winner who now coaches our competitive programming team. His strategic approach has led to many medals for our students.',
      bio_bg: 'Мартин е бивш победител в национална олимпиада, който сега тренира нашия отбор по състезателно програмиране. Неговият стратегически подход е довел до много медали за нашите ученици.',
      image: 'https://randomuser.me/api/portraits/men/45.jpg',
      email: 'martin.kolev@example.com',
      published: true,
      sort_order: 6
    }
  ];
}

/**
 * Fetch teachers from the database or return mock data if not available
 * @returns Array of Teacher objects
 */
export async function getTeachers(): Promise<Teacher[]> {
  try {
    const { data, error } = await supabase
    .from('teachers')
    .select('*')
      .eq('published', true)
    .order('sort_order', { ascending: true });
    
    if (error || !data || data.length === 0) {
      console.log('Using mock teacher data');
      return getMockTeachers();
  }
  
    return data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return getMockTeachers();
  }
} 