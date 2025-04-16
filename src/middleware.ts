import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    console.log('Middleware running for path:', pathname);
    
    // Create a new response
    const res = NextResponse.next();
    
    // Create a Supabase client using the new SSR package
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => request.cookies.get(name)?.value,
          set: (name, value, options) => {
            res.cookies.set({ name, value, ...options });
          },
          remove: (name, options) => {
            res.cookies.delete({ name, ...options });
          },
        },
      }
    );

    // Extract session data
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error in middleware:', error);
      // Continue with no session
    }
    
    console.log('Session check result:', !!session);
    
    // Get the current URL for potential redirects
    const url = new URL(request.url);
    
    // ===== Handle routes =====
    // 1. Admin dashboard redirect if already logged in
    if (pathname === '/admin' && session) {
      console.log('User already authenticated, redirecting to dashboard');
      // Add a cache-busting parameter
      const redirectUrl = new URL('/admin/dashboard', request.url);
      redirectUrl.searchParams.set('t', Date.now().toString());
      return NextResponse.redirect(redirectUrl);
    }
    
    // 2. Protect admin routes
    const isLoginPage = pathname === '/admin';
    const isAdminRoute = pathname.startsWith('/admin') && !isLoginPage;
    
    if (isAdminRoute) {
      // If no session, redirect to login
      if (!session) {
        console.log('No active session, redirecting to login');
        
        // Clear any existing auth cookies to prevent cookie confusion
        res.cookies.delete('sb-access-token');
        res.cookies.delete('sb-refresh-token');
        res.cookies.delete('supabase-auth-token');
        res.cookies.delete('auth_active');
        
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      
      // For authorized users, set proper cache headers
      res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      res.headers.set('Pragma', 'no-cache');
      res.headers.set('Expires', '0');
      
      // Set a custom cookie to verify auth state on client
      res.cookies.set('auth_active', 'true', {
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      
      console.log('Access granted to protected route:', pathname);
    }
    
    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // If error occurs on protected routes, redirect to login
    if (request.nextUrl.pathname.startsWith('/admin') &&
        request.nextUrl.pathname !== '/admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    return NextResponse.next();
  }
}

// Only run middleware on admin routes
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}; 