import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler for fetching courses
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const publishedOnly = searchParams.get('publishedOnly') === 'true';
    const category = searchParams.get('category');
    
    // Build query
    let query = supabase
      .from('courses')
      .select('*')
      .order('sort_order', { ascending: true });
    
    // Filter by published status if specified
    if (publishedOnly) {
      query = query.eq('published', true);
    }
    
    // Filter by category if specified
    if (category) {
      query = query.eq('category', category);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST handler for creating a course
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const session = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session.data.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Insert course
    const { data, error } = await supabase
      .from('courses')
      .insert([body])
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 