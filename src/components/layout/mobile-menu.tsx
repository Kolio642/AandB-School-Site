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
}

/**
 * Mobile menu component that provides navigation for small screens
 * 
 * @param locale - The current locale
 * @param navItems - The navigation items to display
 */
export function MobileMenu({ locale, navItems }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
    
    if (!isOpen) {
      console.log('Mobile menu opened');
    } else {
      console.log('Mobile menu closed');
    }
  }, [isOpen]);
  
  // Handle escape key to close menu
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        console.log('Mobile menu closed with Escape key');
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
        console.log('Mobile menu closed by outside click');
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
        aria-label={isOpen ? "Close Menu" : "Open Menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={toggleMenu}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
      
      {isOpen && (
        <div 
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-0 top-16 z-50 bg-background p-6 animate-in slide-in-from-top-5"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <nav className="flex flex-col gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium transition-colors hover:text-primary"
                onClick={() => {
                  setIsOpen(false);
                  console.log(`Mobile menu: navigated to ${item.href}`);
                }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-6">
              <LanguageSwitcher locale={locale} />
            </div>
          </nav>
        </div>
      )}
    </div>
  );
} 