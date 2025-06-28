import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAllNews, getLatestNews } from '@/data/news';
import { getAllAchievements, getLatestAchievements } from '@/data/achievements';
import { getAllTeachers } from '@/data/teachers';

/**
 * This endpoint forces a reset of the cached data by fetching fresh data
 * This is useful for testing the data fetching system
 */
export async function GET() {
  // Only allow this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'This endpoint is only available in development mode' }, { status: 403 });
  }

  try {
    // Test direct connection to Supabase
    const dbStatus = { success: false, message: '' };
    try {
      const { error } = await supabase.from('news').select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        dbStatus.message = `Error connecting to database: ${error.message}`;
      } else {
        dbStatus.success = true;
        dbStatus.message = 'Successfully connected to database';
      }
    } catch (err: any) {
      dbStatus.message = `Exception in database connection: ${err.message}`;
    }

    // Force refresh cached data
    const newsRefresh = await refreshNews();
    const achievementsRefresh = await refreshAchievements();
    const teachersRefresh = await refreshTeachers();

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: dbStatus,
      newsRefresh,
      achievementsRefresh,
      teachersRefresh
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in test-db-reset endpoint:', error);
    return NextResponse.json({
      error: `Unexpected error: ${error.message}`
    }, { status: 500 });
  }
}

// Helper function to force refresh news data
async function refreshNews() {
  try {
    const news = await getAllNews();
    const latest = await getLatestNews(3);
    return {
      success: true,
      count: news.length,
      latestCount: latest.length,
      message: `Successfully refreshed ${news.length} news items with ${latest.length} latest items`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error refreshing news data: ${err.message}`
    };
  }
}

// Helper function to force refresh achievements data
async function refreshAchievements() {
  try {
    const achievements = await getAllAchievements();
    const latest = await getLatestAchievements(5);
    return {
      success: true,
      count: achievements.length,
      latestCount: latest.length,
      message: `Successfully refreshed ${achievements.length} achievements with ${latest.length} latest items`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error refreshing achievements data: ${err.message}`
    };
  }
}

// Helper function to force refresh teachers data
async function refreshTeachers() {
  try {
    const teachers = await getAllTeachers();
    return {
      success: true,
      count: teachers.length,
      message: `Successfully refreshed ${teachers.length} teachers`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Error refreshing teachers data: ${err.message}`
    };
  }
} 