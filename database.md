# Database and Admin Authentication for A&B School Website

This guide outlines how to implement a database system for the A&B School website, allowing admin authentication and content management for news and achievements.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Setup and Installation](#setup-and-installation)
4. [Database Schema](#database-schema)
5. [Authentication Implementation](#authentication-implementation)
6. [Admin Dashboard](#admin-dashboard)
7. [API Routes](#api-routes)
8. [Integration with Existing Site](#integration-with-existing-site)
9. [Docker Setup](#docker-setup)
10. [Deployment Considerations](#deployment-considerations)

## Architecture Overview

The website will use a hybrid approach:
- Public-facing pages remain static (generated at build time)
- Admin section becomes a client-side application with authenticated API calls
- Database operations happen through secure API endpoints

This approach allows us to:
- Keep the performance benefits of a static site for public users
- Add dynamic capabilities for administrators
- Maintain the current Cloudflare Pages deployment

## Technology Stack

We'll integrate the following technologies with your existing Next.js setup:

1. **Database**: [Supabase](https://supabase.com/)
   - PostgreSQL-based database
   - Built-in authentication system
   - Row-level security for data protection
   - Easy-to-use JavaScript client

2. **Authentication**: Supabase Auth
   - Email/password authentication for admins
   - JWT-based session management
   - Role-based access control

3. **Additional Libraries**:
   - `@supabase/supabase-js`: Official Supabase client
   - `@supabase/auth-helpers-nextjs`: Helpers for Next.js integration
   - `react-hook-form`: Form handling for admin interfaces
   - `zod`: Schema validation for form data

4. **Docker**:
   - Docker Compose setup for local development
   - Containers for:
     - Next.js application
     - Local Supabase instance (for development)

## Setup and Installation

### 1. Install Required Dependencies

```bash
# Install Supabase client and auth helpers
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Install form handling and validation
npm install react-hook-form zod @hookform/resolvers

# Install rich text editor for content (optional)
npm install react-quill
```

### 2. Supabase Project Setup

1. Create a Supabase account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Note your project URL and anon key (public API key)
4. Create the database tables (see Schema section below)

### 3. Environment Variables

Create a `.env.local` file in your project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key should only be used in secure server contexts, not exposed to the client.

## Database Schema

### Users Table

This is automatically created by Supabase Auth.

### News Table

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content_en TEXT NOT NULL,
  content_bg TEXT NOT NULL,
  image_url VARCHAR(255),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_news_published_at ON news(published_at);

-- Enable row-level security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published news" 
  ON news FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can insert news" 
  ON news FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update news" 
  ON news FOR UPDATE 
  TO authenticated 
  USING (true);
```

### Achievements Table

```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en VARCHAR(255) NOT NULL,
  title_bg VARCHAR(255) NOT NULL,
  description_en TEXT NOT NULL,
  description_bg TEXT NOT NULL,
  date DATE NOT NULL,
  image_url VARCHAR(255),
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX idx_achievements_date ON achievements(date);

-- Enable row-level security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published achievements" 
  ON achievements FOR SELECT 
  USING (published = true);

CREATE POLICY "Only authenticated users can insert achievements" 
  ON achievements FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update achievements" 
  ON achievements FOR UPDATE 
  TO authenticated 
  USING (true);
```

## Authentication Implementation

### 1. Create a Supabase Client

Create a file at `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Create Auth Context

Create a file at `src/context/auth-context.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    loadUserData();
  }, []);

  const signIn = async (email: string, password: string) => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### 3. Add Authentication Provider to Layout

Modify `src/app/[locale]/layout.tsx` to include the AuthProvider:

```typescript
import { AuthProvider } from '@/context/auth-context';

// In your layout component
return (
  <html lang={locale}>
    <body className={inter.variable}>
      <AuthProvider>
        {/* Existing components */}
      </AuthProvider>
    </body>
  </html>
);
```

### 4. Create Login Page

Create a file at `src/app/[locale]/admin/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn(data.email, data.password);
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-gray-600 mt-2">Sign in to access the admin dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

## Admin Dashboard

Create a dashboard layout and pages:

### 1. Admin Layout

Create a file at `src/app/[locale]/admin/layout.tsx`:

```typescript
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4">
        <div className="mb-8">
          <h2 className="text-xl font-bold">A&B School Admin</h2>
        </div>
        <nav className="space-y-2">
          <Link 
            href="/admin/dashboard" 
            className="block p-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/news" 
            className="block p-2 rounded hover:bg-gray-700"
          >
            News Management
          </Link>
          <Link 
            href="/admin/achievements" 
            className="block p-2 rounded hover:bg-gray-700"
          >
            Achievements Management
          </Link>
        </nav>
        <div className="mt-auto pt-8">
          <button 
            onClick={() => signOut()}
            className="w-full p-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        {children}
      </div>
    </div>
  );
}
```

### 2. Dashboard Page

Create a file at `src/app/[locale]/admin/dashboard/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    news: 0,
    achievements: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      setIsLoading(true);
      
      try {
        // Get news count
        const { count: newsCount } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true });
        
        // Get achievements count
        const { count: achievementsCount } = await supabase
          .from('achievements')
          .select('*', { count: 'exact', head: true });
        
        setCounts({
          news: newsCount || 0,
          achievements: achievementsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCounts();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {isLoading ? (
        <div>Loading statistics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">News Articles</h2>
            <p className="text-4xl font-bold">{counts.news}</p>
            <div className="mt-4">
              <a 
                href="/admin/news" 
                className="text-primary hover:underline"
              >
                Manage News →
              </a>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Achievements</h2>
            <p className="text-4xl font-bold">{counts.achievements}</p>
            <div className="mt-4">
              <a 
                href="/admin/achievements" 
                className="text-primary hover:underline"
              >
                Manage Achievements →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## API Routes

For the API routes, we'll be using the Route Handlers feature of Next.js App Router.

### 1. News API Routes

Create a file at `src/app/api/news/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const startIndex = (page - 1) * limit;
    
    // Get published news articles with pagination
    const { data, error, count } = await supabase
      .from('news')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .filter('published', 'eq', true)
      .range(startIndex, startIndex + limit - 1);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      data, 
      total: count,
      page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('news')
      .insert([body])
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}
```

Create a file at `src/app/api/news/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return NextResponse.json(
        { error: 'News article not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('news')
      .update(body)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating news article:', error);
    return NextResponse.json(
      { error: 'Failed to update news article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news article:', error);
    return NextResponse.json(
      { error: 'Failed to delete news article' },
      { status: 500 }
    );
  }
}
```

### 2. Similar API Routes for Achievements

Create similar route files for achievements following the same pattern.

## Integration with Existing Site

### 1. Fetch News Data During Build

Modify your existing news page to fetch data from Supabase:

```typescript
// src/app/[locale]/news/page.tsx
import { createClient } from '@supabase/supabase-js';

// Create a server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateStaticParams() {
  // Your existing code for locales
}

export async function getNewsArticles() {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .filter('published', 'eq', true)
    .order('published_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }
  
  return data || [];
}

export default async function NewsPage({ params }: { params: { locale: string } }) {
  const news = await getNewsArticles();
  
  // Rest of your component
}
```

### 2. Similar Approach for Achievements Page

Apply a similar pattern to fetch achievement data for the achievements page.

## Docker Setup

To see the Docker setup details, please refer to the `docker.md` file in this repository.

## Deployment Considerations

### 1. Adjusting the Next.js Configuration

Modify your `next.config.js` to handle dynamic routes for the admin section:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Keep static export for public pages
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Add exceptions to static export for admin routes that need to be dynamic
  exportPathMap: async function (defaultPathMap) {
    // Filter out admin paths from static export
    const filteredPaths = {};
    for (const [path, page] of Object.entries(defaultPathMap)) {
      if (!path.startsWith('/admin')) {
        filteredPaths[path] = page;
      }
    }
    return filteredPaths;
  },
};

module.exports = nextConfig;
```

### 2. Hosting Considerations

For hosting, you have a few options:

1. **Split Deployment**:
   - Continue using Cloudflare Pages for the public static site
   - Deploy the admin section to a service like Vercel that supports server-side rendering

2. **Cloudflare Pages with Functions**:
   - Use Cloudflare Pages Functions for the API routes
   - Enable Server-Side Rendering features of Cloudflare Pages

3. **Hybrid Static + Serverless**:
   - Deploy the static site to Cloudflare
   - Use serverless functions (like Cloudflare Workers) for authentication and database operations

### 3. Database and Authentication in Production

For production:

1. Set up proper environment variables in your CI/CD pipeline
2. Configure secure CORS policies in Supabase
3. Regularly backup your database
4. Monitor database usage and performance

## Conclusion

This guide provides a starting point for adding a database and admin authentication to your A&B School website. The proposed architecture maintains the performance benefits of a static site while adding dynamic capabilities where needed.

For security reasons, remember to:
- Never commit your Supabase keys to your repository
- Use environment variables for sensitive information
- Implement proper validation and error handling
- Regularly audit your authentication system

For the Docker setup, please refer to the `docker.md` file that complements this guide. 