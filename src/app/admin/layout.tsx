'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && pathname !== '/admin') {
          router.push('/admin');
          return;
        }

        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Session check error:', error);
        router.push('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session && pathname !== '/admin') {
        router.push('/admin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show login page without layout
  if (pathname === '/admin') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-bold">Loading...</div>
          <div className="text-muted-foreground">Please wait while we verify your session.</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Auth check will redirect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin/dashboard" className="text-xl font-bold">
              A&B School Admin
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/admin/dashboard" 
                className={pathname === '/admin/dashboard' ? 'font-semibold' : ''}
              >
                Dashboard
              </Link>
              <Link 
                href="/admin/news" 
                className={pathname.startsWith('/admin/news') ? 'font-semibold' : ''}
              >
                News
              </Link>
              <Link 
                href="/admin/achievements" 
                className={pathname.startsWith('/admin/achievements') ? 'font-semibold' : ''}
              >
                Achievements
              </Link>
            </nav>
          </div>
          <button 
            onClick={handleSignOut}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1 container py-6">
        {children}
      </main>
      <footer className="border-t py-4 bg-background">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} A&B School Admin Panel
        </div>
      </footer>
    </div>
  );
} 