import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  FileText, 
  Trophy, 
  Users, 
  BookOpen, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown
} from 'lucide-react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkedInitialAuth, setCheckedInitialAuth] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Navigation items with icons
  const navItems = [
    { 
      href: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      href: '/admin/news', 
      label: 'News Management', 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      href: '/admin/achievements', 
      label: 'Achievements', 
      icon: <Trophy className="w-5 h-5" /> 
    },
    { 
      href: '/admin/teachers', 
      label: 'Teachers', 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      href: '/admin/courses', 
      label: 'Courses', 
      icon: <BookOpen className="w-5 h-5" /> 
    }
  ];

  // Check if a nav item is active
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  // Determine nav item classes based on active state
  const getNavItemClasses = (href: string) => {
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      isActive(href)
        ? 'bg-primary text-primary-foreground font-medium'
        : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
    }`;
  };

  // Show loading state
  if (isLoading || !checkedInitialAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg text-gray-700">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow sticky top-0 z-30">
        <div className="mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/admin/dashboard" className="text-xl font-bold">
              A&B School Admin
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium">{user.email}</span>
                  <span className="text-xs text-gray-500">Administrator</span>
                </div>
                <div className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium text-gray-700 p-2 rounded-full hover:bg-gray-100">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {user.email?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10 invisible group-hover:visible">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">Account</div>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile nav overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-40 md:hidden" 
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar navigation */}
        <aside 
          className={`
            fixed md:sticky top-[65px] md:top-[73px] z-50 md:z-0 
            w-64 md:w-64 shrink-0 h-[calc(100vh-65px)] md:h-[calc(100vh-73px)]
            bg-white shadow-lg md:shadow-none overflow-y-auto
            transition-transform duration-300 transform
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <nav className="p-4">
            <ul className="space-y-1.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} 
                    className={getNavItemClasses(item.href)}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 mx-auto w-full">
          <div className="bg-white shadow rounded-lg p-5 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 