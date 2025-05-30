import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler for fetching news items
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const publishedOnly = searchParams.get('publishedOnly') === 'true';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('news')
      .select('*', { count: 'exact' })
      .order('date', { ascending: false });
    
    // Filter by published status if specified
    if (publishedOnly) {
      query = query.eq('published', true);
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      data, 
      count,
      pagination: {
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST handler for creating a news item
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
    
    // Insert news item
    const { data, error } = await supabase
      .from('news')
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