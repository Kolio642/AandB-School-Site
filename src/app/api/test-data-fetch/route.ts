import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllNews } from '@/data/news';
import { getAllAchievements } from '@/data/achievements';
import { getAllTeachers } from '@/data/teachers';

export async function GET() {
  try {
    // Test direct Supabase connection
    const dbConnection = { success: false, message: '' };
    try {
      const { data, error } = await supabase.from('news').select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        dbConnection.message = `Error connecting to Supabase: ${error.message}`;
      } else {
        dbConnection.success = true;
        dbConnection.message = 'Successfully connected to Supabase';
      }
    } catch (err: any) {
      dbConnection.message = `Exception in Supabase connection: ${err.message}`;
    }

    // Test getAllNews function
    let newsTest = { success: false, count: 0, message: '' };
    try {
      const news = await getAllNews();
      newsTest = {
        success: true,
        count: news.length,
        message: `Successfully fetched ${news.length} news items`
      };
    } catch (err: any) {
      newsTest.message = `Error fetching news: ${err.message}`;
    }

    // Test getAllAchievements function
    let achievementsTest = { success: false, count: 0, message: '' };
    try {
      const achievements = await getAllAchievements();
      achievementsTest = {
        success: true,
        count: achievements.length,
        message: `Successfully fetched ${achievements.length} achievements`
      };
    } catch (err: any) {
      achievementsTest.message = `Error fetching achievements: ${err.message}`;
    }

    // Test getAllTeachers function
    let teachersTest = { success: false, count: 0, message: '' };
    try {
      const teachers = await getAllTeachers(true);
      teachersTest = {
        success: true,
        count: teachers.length,
        message: `Successfully fetched ${teachers.length} teachers`
      };
    } catch (err: any) {
      teachersTest.message = `Error fetching teachers: ${err.message}`;
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: dbConnection,
      news: newsTest,
      achievements: achievementsTest,
      teachers: teachersTest
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: `Unexpected error: ${error.message}`
    }, { status: 500 });
  }
} 