import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Supported locales
const locales = ['en', 'bg'];
const defaultLocale = 'bg';

// Cache regex patterns for better performance
const STATIC_FILE_REGEX = /\.(.*)$/;
const NEXT_INTERNAL_PATHS = /^\/_next\//;
const API_PATHS = /^\/api\//;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware processing for static files and Next.js internals (faster check with regex)
  if (
    NEXT_INTERNAL_PATHS.test(pathname) || 
    API_PATHS.test(pathname) ||
    STATIC_FILE_REGEX.test(pathname) || 
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }
  
  // Check if pathname has a locale prefix
  const segments = pathname.split('/').filter(Boolean);
  const hasLocalePrefix = segments.length > 0 && locales.includes(segments[0]);
  
  // Force Bulgarian everywhere
  if (hasLocalePrefix && segments[0] === 'en') {
    // Replace the 'en' segment with 'bg', but keep the rest of the path
    const bgPath = '/' + ['bg', ...segments.slice(1)].join('/');
    const response = NextResponse.redirect(new URL(bgPath, request.url));
    
    // Set cookie to ensure Bulgarian locale is preserved
    response.cookies.set('NEXT_LOCALE', 'bg', { 
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: 'lax'
    });
    
    return response;
  }
  
  // Special case for admin routes - faster check
  if (pathname.startsWith('/admin')) {
    // Debug: Log all cookies for troubleshooting
    if (process.env.NODE_ENV !== 'production') {
      console.log('Middleware: Cookies for admin route:', [...request.cookies.getAll()]
        .map(c => `${c.name}=${c.value.substring(0, 15)}...`)
        .join(', '));
    }
    
    // Check for auth cookie - look for sb-* cookies that Supabase uses
    const hasAuthCookie = [...request.cookies.getAll()]
      .some(cookie => 
        cookie.name.startsWith('sb-') || 
        cookie.name === 'supabase-auth-token'
      );
    
    // Protect admin routes (except login page and root admin)
    if (pathname !== '/admin' && !pathname.startsWith('/admin/login')) {
      // If we have session cookies, proceed; otherwise redirect to login
      if (!hasAuthCookie) {
        console.log('Middleware: No Supabase auth cookies found, redirecting to admin login');
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        console.log('Middleware: Auth cookies found, allowing access to admin route');
      }
    }
    
    // Admin routes remain non-localized
    return NextResponse.next();
  }
  
  // For signout, don't redirect
  if (pathname === '/signout') {
    return NextResponse.next();
  }
  
  // For public routes that don't have a locale prefix, redirect to Bulgarian
  if (!hasLocalePrefix && pathname !== '/') {
    const response = NextResponse.redirect(new URL(`/bg${pathname}`, request.url));
    
    // Set cookie to ensure Bulgarian locale is preserved
    response.cookies.set('NEXT_LOCALE', 'bg', { 
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: 'lax'
    });
    
    return response;
  }
  
  // For root path, redirect to Bulgarian
  if (pathname === '/') {
    const response = NextResponse.redirect(new URL('/bg', request.url));
    
    // Set cookie to ensure Bulgarian locale is preserved
    response.cookies.set('NEXT_LOCALE', 'bg', { 
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: 'lax'
    });
    
    return response;
  }
  
  // For bg paths, ensure the cookie is set
  if (hasLocalePrefix && segments[0] === 'bg') {
    const response = NextResponse.next();
    
    // Set cookie to ensure Bulgarian locale is preserved
    response.cookies.set('NEXT_LOCALE', 'bg', { 
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
      sameSite: 'lax'
    });
    
    return response;
  }
  
  // For all other routes, pass through
  return NextResponse.next();
}

// Configure the middleware to run for specific paths
export const config = {
  matcher: [
    // Exclude static assets and api routes for better performance
    '/((?!_next/static|_next/image|_next/data|api|favicon.ico).*)',
  ]
}; 