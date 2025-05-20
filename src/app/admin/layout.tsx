'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import type { Metadata } from 'next';

// Opt out of static generation for all admin routes
export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const { signOut, user, isLoading: authLoading } = useAuth();

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (!authLoading && !user && pathname !== '/admin' && !pathname.startsWith('/admin/login')) {
      window.location.href = '/admin';
    }
  }, [pathname, user, authLoading]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear cookies first
      document.cookie = 'sb-refresh-token=; path=/; max-age=0; samesite=lax';
      document.cookie = 'sb-access-token=; path=/; max-age=0; samesite=lax';
      document.cookie = 'dashboard_visited=; path=/; max-age=0; samesite=lax';
      document.cookie = 'auth_success=; path=/; max-age=0; samesite=lax';
      
      // Sign out via auth context
      await signOut();
      
      // Navigate directly to the signout endpoint
      window.location.href = '/signout';
      
    } catch (error) {
      console.error('Sign out error:', error);
      // Emergency fallback - direct navigation
      window.location.href = '/admin?signout=true';
    } finally {
      setIsLoading(false);
    }
  };

  // Only render children on login page
  if (pathname === '/admin' || pathname.startsWith('/admin/login')) {
    return children;
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const NavLink = ({ href, children, isActive = false }: { href: string; children: React.ReactNode; isActive?: boolean }) => (
    <a
      href={href}
      className={`${isActive ? 'font-semibold' : ''} hover:text-primary transition-colors`}
    >
      {children}
    </a>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-6">
            <a href="/admin/dashboard" className="text-xl font-bold">
              A&B School Admin
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink
                href="/admin/dashboard"
                isActive={pathname === '/admin/dashboard'}
              >
                Dashboard
              </NavLink>
              <NavLink
                href="/admin/news"
                isActive={pathname.startsWith('/admin/news')}
              >
                News
              </NavLink>
              <NavLink
                href="/admin/achievements"
                isActive={pathname.startsWith('/admin/achievements')}
              >
                Achievements
              </NavLink>
              <NavLink
                href="/admin/teachers"
                isActive={pathname.startsWith('/admin/teachers')}
              >
                Teachers
              </NavLink>
              <NavLink
                href="/admin/courses"
                isActive={pathname.startsWith('/admin/courses')}
              >
                Courses
              </NavLink>
              <NavLink
                href="/admin/contacts"
                isActive={pathname.startsWith('/admin/contacts')}
              >
                Contacts
              </NavLink>
            </nav>
          </div>
          <Button 
            onClick={handleSignOut}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
            <LogOut className="h-4 w-4" />
          </Button>
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