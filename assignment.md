# Building the Admin Authentication and Dashboard System

## Overview

This document provides detailed instructions for implementing a comprehensive admin authentication system and dashboard for the A&B School website. The system should allow administrators to log in securely, manage content (news and achievements), and handle multilingual content in both English and Bulgarian.

## 1. Authentication System Setup

### 1.1 Supabase Authentication Configuration

1. **Set up Supabase Project:**
   - Create a new project in Supabase dashboard
   - Get the project URL and anon key for environment variables
   - Add them to the `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

2. **Configure Authentication Providers:**
   - Enable Email/Password authentication in Supabase Authentication settings
   - Disable public sign-ups to ensure only admins can be created through the backend
   - Set up password policies (minimum length, character requirements)

3. **Create Admin Users:**
   - Create admin users through the Supabase dashboard
   - Use strong passwords for initial accounts

### 1.2 Authentication Context Provider

1. **Create Auth Context:**
   - Implement a global auth context in `src/context/auth-context.tsx`
   - Provide authentication state to the entire admin area
   - Expose the following:
     - `user`: Current authenticated user object
     - `session`: Current authentication session
     - `isLoading`: Authentication state loading indicator
     - `signIn`: Function to authenticate users
     - `signOut`: Function to end sessions

2. **Authentication State Management:**
   - Initialize authentication state from Supabase during component mount
   - Set up a subscription to auth state changes
   - Properly handle loading states and errors

```tsx
// src/context/auth-context.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 2. Admin UI Components

### 2.1 Admin Login Form

1. **Create Login Page:**
   - Implement `src/components/admin/login-form.tsx`
   - Use React Hook Form with Zod validation
   - Handle loading states and error messages

```tsx
// src/components/admin/login-form.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setError('Invalid email or password');
        return;
      }
      
      // Set success marker cookie to help with auth state transitions
      document.cookie = 'auth_success=true; max-age=60; path=/';
      router.push('/admin/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          {...register('email')}
          type="email"
          autoComplete="email"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="password">Password</label>
        <Input
          id="password"
          {...register('password')}
          type="password"
          autoComplete="current-password"
          disabled={isLoading}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
```

### 2.2 Admin Dashboard Layout

1. **Create Dashboard Layout:**
   - Implement `src/components/admin/dashboard-layout.tsx`
   - Include navigation, header, and auth-protected wrapper

```tsx
// src/components/admin/dashboard-layout.tsx
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [checkedInitialAuth, setCheckedInitialAuth] = useState(false);

  useEffect(() => {
    // Auth check after loading completes
    if (!isLoading) {
      // Check for auth success cookie to prevent redirect loops
      const hasAuthCookie = document.cookie.includes('auth_success=true');
      
      if (!user && !hasAuthCookie) {
        router.push('/admin/login');
      } else {
        setCheckedInitialAuth(true);
      }
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/admin/login');
  };

  // Show loading state
  if (isLoading || !checkedInitialAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <nav className="bg-white shadow rounded-lg p-4">
              <ul className="space-y-2">
                <li>
                  <a href="/admin/dashboard" className="block p-2 hover:bg-gray-50 rounded">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/admin/news" className="block p-2 hover:bg-gray-50 rounded">
                    News Management
                  </a>
                </li>
                <li>
                  <a href="/admin/achievements" className="block p-2 hover:bg-gray-50 rounded">
                    Achievements
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          
          <main className="col-span-12 lg:col-span-9">
            <div className="bg-white shadow rounded-lg p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
```

### 2.3 Form Components for Content Management

1. **News Form Component:**
   - Create `src/components/admin/news-form.tsx`
   - Include fields for both English and Bulgarian content
   - Handle image uploads and form validation

```tsx
// src/components/admin/news-form.tsx
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';

const newsSchema = z.object({
  title_en: z.string().min(3, 'Title is required (min 3 characters)'),
  title_bg: z.string().min(3, 'Title is required (min 3 characters)'),
  summary_en: z.string().min(10, 'Summary is required (min 10 characters)'),
  summary_bg: z.string().min(10, 'Summary is required (min 10 characters)'),
  content_en: z.string().min(50, 'Content is required (min 50 characters)'),
  content_bg: z.string().min(50, 'Content is required (min 50 characters)'),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
  published: z.boolean().default(false),
  image: z.string().min(5, 'Image URL is required'),
});

type NewsFormValues = z.infer<typeof newsSchema>;

interface NewsFormProps {
  initialData?: NewsFormValues;
  onSubmit: (data: NewsFormValues) => Promise<void>;
}

export function NewsForm({ initialData, onSubmit }: NewsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: initialData || {
      title_en: '',
      title_bg: '',
      summary_en: '',
      summary_bg: '',
      content_en: '',
      content_bg: '',
      date: new Date().toISOString().substring(0, 10),
      published: false,
      image: '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (data: NewsFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Upload image if there's a new one
      if (imageFile) {
        const fileName = `news/${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('public')
          .upload(fileName, imageFile);
          
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('public').getPublicUrl(fileName);
        data.image = urlData.publicUrl;
      }
      
      await onSubmit(data);
      router.push('/admin/news');
    } catch (err: any) {
      setError(err.message || 'Failed to save news item');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Tabs defaultValue="english">
        <TabsList>
          <TabsTrigger value="english">English</TabsTrigger>
          <TabsTrigger value="bulgarian">Bulgarian</TabsTrigger>
        </TabsList>
        
        <TabsContent value="english" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title_en">Title (English)</Label>
            <Input
              id="title_en"
              {...register('title_en')}
              disabled={isLoading}
            />
            {errors.title_en && (
              <p className="text-sm text-red-500">{errors.title_en.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary_en">Summary (English)</Label>
            <Textarea
              id="summary_en"
              {...register('summary_en')}
              disabled={isLoading}
              rows={3}
            />
            {errors.summary_en && (
              <p className="text-sm text-red-500">{errors.summary_en.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content_en">Content (English)</Label>
            <Textarea
              id="content_en"
              {...register('content_en')}
              disabled={isLoading}
              rows={10}
            />
            {errors.content_en && (
              <p className="text-sm text-red-500">{errors.content_en.message}</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="bulgarian" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title_bg">Title (Bulgarian)</Label>
            <Input
              id="title_bg"
              {...register('title_bg')}
              disabled={isLoading}
            />
            {errors.title_bg && (
              <p className="text-sm text-red-500">{errors.title_bg.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary_bg">Summary (Bulgarian)</Label>
            <Textarea
              id="summary_bg"
              {...register('summary_bg')}
              disabled={isLoading}
              rows={3}
            />
            {errors.summary_bg && (
              <p className="text-sm text-red-500">{errors.summary_bg.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content_bg">Content (Bulgarian)</Label>
            <Textarea
              id="content_bg"
              {...register('content_bg')}
              disabled={isLoading}
              rows={10}
            />
            {errors.content_bg && (
              <p className="text-sm text-red-500">{errors.content_bg.message}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            disabled={isLoading}
          />
          {errors.date && (
            <p className="text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
          />
          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message}</p>
          )}
        </div>
      </div>
      
      {imagePreview && (
        <div className="mt-2">
          <Label>Image Preview</Label>
          <div className="mt-1 border rounded-md overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-40 object-contain" 
            />
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={watch('published')}
          onCheckedChange={(checked) => setValue('published', checked)}
          disabled={isLoading}
        />
        <Label htmlFor="published">Publish this news item</Label>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/news')}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save News Item'}
        </Button>
      </div>
    </form>
  );
}
```

2. **Achievement Form Component:**
   - Create `src/components/admin/achievement-form.tsx`
   - Follow similar pattern to the news form

## 3. Route Configuration

### 3.1 Admin API Routes

1. **Admin Authentication API:**
   - Create callback handler for authentication

### 3.2 Admin Page Routes

1. **Admin Login Page:**
   - Create `src/app/admin/login/page.tsx`

```tsx
// src/app/admin/login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { useAuth } from '@/context/auth-context';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/admin/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

2. **Admin Dashboard Page:**
   - Create `src/app/admin/dashboard/page.tsx`

```tsx
// src/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/admin/dashboard-layout';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  newsCount: number;
  achievementsCount: number;
  publishedNewsCount: number;
  publishedAchievementsCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    newsCount: 0,
    achievementsCount: 0,
    publishedNewsCount: 0,
    publishedAchievementsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch counts in parallel
        const [
          { count: newsCount }, 
          { count: achievementsCount },
          { count: publishedNewsCount },
          { count: publishedAchievementsCount },
        ] = await Promise.all([
          supabase.from('news').select('*', { count: 'exact', head: true }),
          supabase.from('achievements').select('*', { count: 'exact', head: true }),
          supabase.from('news').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('published', true),
        ]);

        setStats({
          newsCount: newsCount || 0,
          achievementsCount: achievementsCount || 0,
          publishedNewsCount: publishedNewsCount || 0,
          publishedAchievementsCount: publishedAchievementsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Dashboard Overview</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-900">News Articles</h3>
            <div className="mt-2 flex justify-between items-baseline">
              <div className="text-3xl font-bold text-blue-600">{stats.newsCount}</div>
              <div className="text-sm text-blue-500">
                {stats.publishedNewsCount} published
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
            <h3 className="text-lg font-medium text-emerald-900">Achievements</h3>
            <div className="mt-2 flex justify-between items-baseline">
              <div className="text-3xl font-bold text-emerald-600">{stats.achievementsCount}</div>
              <div className="text-sm text-emerald-500">
                {stats.publishedAchievementsCount} published
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
```

3. **Admin News Management Pages:**
   - Create listing, add, edit, and delete pages

4. **Admin Achievements Management Pages:**
   - Create listing, add, edit, and delete pages

### 3.3 Middleware for Route Protection

1. **Update Middleware:**
   - Enhance `src/middleware.ts` to protect admin routes

```tsx
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only run on admin routes (except login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Create a Supabase client for auth checks
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, redirect to login
    if (!session) {
      const url = new URL('/admin/login', request.url);
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configure the middleware to run for specific paths
export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
```

## 4. Testing and Debugging

### 4.1 Authentication Flow Testing

1. **Test Login Flow:**
   - Test valid credentials
   - Test invalid credentials
   - Test redirect behavior

2. **Test Session Persistence:**
   - Test browser refresh
   - Test timeout behavior

### 4.2 Content Management Testing

1. **Test News Management:**
   - Create, read, update, delete operations
   - Bilingual content
   - Image uploads
   - Publication status

2. **Test Achievements Management:**
   - Create, read, update, delete operations
   - Bilingual content
   - Image uploads
   - Publication status

### 4.3 Error Handling

1. **Implement Error Boundaries:**
   - Add error boundaries for admin routes
   - Provide user-friendly error messages

## 5. Security Considerations

### 5.1 Authentication Security

1. **Enforce Strong Passwords:**
   - Minimum length and complexity requirements
   - Regular password rotation

2. **Rate Limiting:**
   - Configure rate limiting for login attempts
   - Implement temporary lockouts after failed attempts

### 5.2 Authorization Controls

1. **Role-Based Access Control:**
   - Consider implementing roles (admin, editor, etc.)
   - Restrict access to sensitive operations

2. **Data Validation:**
   - Validate all input on the server side
   - Sanitize content to prevent XSS

### 5.3 Session Management

1. **Session Timeouts:**
   - Configure appropriate session timeouts
   - Implement refresh token rotation

2. **Secure Cookie Usage:**
   - Use HTTP-only cookies
   - Implement CSRF protection

## 6. Deployment Considerations

1. **Environment Variables:**
   - Ensure all secrets are properly stored in environment variables
   - Keep service role key secure

2. **Production Checks:**
   - Test authentication flow in the production environment
   - Verify database permissions and policies

This implementation guide provides a comprehensive approach to building a secure, scalable admin authentication and dashboard system for the A&B School website. By following these instructions, you'll create a robust admin experience with proper authentication, content management, and security practices. 