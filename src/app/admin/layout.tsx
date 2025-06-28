'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  Home, 
  Newspaper, 
  Award, 
  Users,
  Menu, 
  X
} from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated (except on login page)
  useEffect(() => {
    console.log('Admin layout auth check:', { user: !!user, authLoading, pathname });
    
    if (!authLoading && !user && pathname !== '/admin' && !pathname.startsWith('/admin/login')) {
      console.log('No authenticated user detected in layout, redirecting to login');
      window.location.href = '/admin';
    }
  }, [pathname, user, authLoading]);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      console.log('Signing out from admin layout...');
      
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" />, isActive: pathname === '/admin/dashboard' },
    { href: '/admin/news', label: 'News', icon: <Newspaper className="h-4 w-4" />, isActive: pathname.startsWith('/admin/news') },
    { href: '/admin/achievements', label: 'Achievements', icon: <Award className="h-4 w-4" />, isActive: pathname.startsWith('/admin/achievements') },
    { href: '/admin/teachers', label: 'Teachers', icon: <Users className="h-4 w-4" />, isActive: pathname.startsWith('/admin/teachers') },
  ];

  const NavLink = ({ href, label, icon, isActive = false }: { href: string; label: string; icon: React.ReactNode; isActive?: boolean }) => (
    <Link
      href={href}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary text-primary-foreground font-medium' 
          : 'hover:bg-muted'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-md w-8 h-8 flex items-center justify-center text-white shadow-sm">A&B</span>
              <span className="hidden md:inline-block">Admin Panel</span>
            </Link>
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink 
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={item.isActive}
              />
            ))}
          </nav>
          
          <div className="flex items-center">
            {user && (
              <div className="mr-4 hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                </div>
              </div>
            )}
            <Button 
              onClick={handleSignOut}
              disabled={isLoading}
              className="gap-2"
              variant="destructive"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{isLoading ? 'Signing out...' : 'Sign Out'}</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink 
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={item.isActive}
                />
              ))}
            </div>
          </div>
        )}
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {children}
        </div>
      </main>
      
      <footer className="border-t py-4 bg-white">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} A&B School Admin Panel</div>
          <div className="flex items-center gap-4">
            <Link href="/bg" className="hover:text-primary">View Website</Link>
            <span>Version 1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
} 