'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import type { Metadata } from 'next';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const { signOut, user } = useAuth();

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    if (pathname !== '/admin' && !user) {
      console.log('No authenticated user detected in layout, redirecting to login');
      window.location.replace('/admin');
    }
  }, [pathname, user]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      console.log('Signing out from admin layout...');
      await signOut(); // Uses the signOut method from auth context
      // No need to redirect here as the signOut method already handles it
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback redirect in case of error
      window.location.href = '/admin';
    } finally {
      setIsLoading(false);
    }
  };

  // Only render children on login page
  if (pathname === '/admin') {
    return children;
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