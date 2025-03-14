import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  try {
    // Only run this middleware for admin routes
    if (!request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.next();
    }

    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });
    
    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // Return the response without modifying it if there's an error
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match admin routes and exclude:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 