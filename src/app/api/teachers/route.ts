import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET handler for fetching teachers
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const publishedOnly = searchParams.get('publishedOnly') === 'true';
    
    // Build query
    let query = supabase
      .from('teachers')
      .select('*')
      .order('sort_order', { ascending: true });
    
    // Filter by published status if specified
    if (publishedOnly) {
      query = query.eq('published', true);
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

// POST handler for creating a teacher
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
    
    // Insert teacher
    const { data, error } = await supabase
      .from('teachers')
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