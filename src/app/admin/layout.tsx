'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/admin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

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