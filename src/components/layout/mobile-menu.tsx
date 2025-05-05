'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';

/**
 * Interface for navigation items
 */
interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  locale: Locale;
  navItems: NavItem[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

/**
 * Mobile menu component that provides navigation for small screens
 * 
 * @param locale - The current locale
 * @param navItems - The navigation items to display
 * @param testimonial - Optional testimonial to display
 */
export function MobileMenu({ locale, navItems, testimonial }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);
  
  // Handle escape key to close menu
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  // Handle clicks outside the menu to close it
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // If no nav items are provided, log a warning
  if (!navItems || navItems.length === 0) {
    console.warn('No navigation items provided to MobileMenu');
    return null;
  }

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full"
        aria-label={isOpen ? "Close Menu" : "Open Menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={toggleMenu}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      {isOpen && (
        <div 
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-0 top-16 z-50 bg-background flex flex-col animate-in slide-in-from-top duration-300 h-[calc(100vh-4rem)] overflow-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <div className="flex justify-between items-center">
              <div className="text-xl font-bold">
                {locale === 'en' ? 'Menu' : 'Меню'}
              </div>
              <LanguageSwitcher locale={locale} variant="pill" />
            </div>
          </div>
          
          <div className="flex-1 p-6 overflow-auto">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg font-medium py-3 px-4 rounded-md transition-colors hover:bg-muted/60 active:bg-muted/80 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            
            {testimonial && (
              <div className="mt-8 border-t border-border pt-6">
                <div className="text-3xl font-serif text-primary opacity-70 mb-2">"</div>
                <blockquote className="italic text-muted-foreground mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-sm font-medium">
                  {testimonial.author}
                  {testimonial.role && (
                    <span className="text-muted-foreground ml-1">
                      — {testimonial.role}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 mt-auto border-t bg-background/95 backdrop-blur-sm sticky bottom-0">
            <Button 
              className="w-full"
              asChild
              onClick={() => setIsOpen(false)}
            >
              <Link href={`/${locale}/contacts`}>
                {locale === 'en' ? 'Contact Us' : 'Свържете се с нас'}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 