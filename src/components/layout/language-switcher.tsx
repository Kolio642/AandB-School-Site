'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Locale, locales, getLocalePartsFrom } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

interface LanguageSwitcherProps {
  locale: Locale;
  variant?: 'default' | 'pill';
}

/**
 * Language Switcher component that allows users to change the application language
 * 
 * @param locale - The current locale being used in the application
 * @param variant - Visual variant of the language switcher (default or pill)
 */
export function LanguageSwitcher({ locale, variant = 'default' }: LanguageSwitcherProps) {
  const pathname = usePathname();
  
  /**
   * Creates the correct path for the target locale
   * 
   * @param targetLocale - The locale to create a path for
   * @returns The path with the target locale
   */
  const createLocalePath = useCallback((targetLocale: Locale): string => {
    try {
      // For App Router with [locale] parameter
      // Split the path and replace the locale segment
      const pathParts = pathname.split('/').filter(Boolean);
      
      // If the first part is the current locale, replace it
      if (pathParts[0] === locale) {
        pathParts[0] = targetLocale;
        return `/${pathParts.join('/')}`;
      }
      
      // If we're at the root or the path doesn't start with the locale
      return `/${targetLocale}${pathParts.length ? `/${pathParts.join('/')}` : ''}`;
    } catch (error) {
      console.error(`Error creating path for locale '${targetLocale}':`, error);
      // Fallback to a safe path
      return `/${targetLocale}`;
    }
  }, [pathname, locale]);
  
  // If there's an issue with the locales array, provide sensible fallback behavior
  if (!locales.length) {
    console.warn('No locales configured for language switcher');
    return null;
  }
  
  if (variant === 'pill') {
    return (
      <div className="flex items-center overflow-hidden rounded-full bg-muted/50 p-1 text-sm" aria-label="Language selector">
        {locales.map((lang) => (
          <Link 
            key={lang} 
            href={createLocalePath(lang)}
            aria-label={`Switch to ${lang === 'en' ? 'English' : 'Bulgarian'}`}
            aria-current={locale === lang ? 'page' : undefined}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              locale === lang 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {lang.toUpperCase()}
          </Link>
        ))}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1" aria-label="Language selector">
      {locales.map((lang) => (
        <Link 
          key={lang} 
          href={createLocalePath(lang)}
          aria-label={`Switch to ${lang === 'en' ? 'English' : 'Bulgarian'}`}
          aria-current={locale === lang ? 'page' : undefined}
        >
          <Button 
            variant={locale === lang ? 'default' : 'ghost'} 
            size="sm" 
            className="w-10 px-2"
          >
            {lang.toUpperCase()}
          </Button>
        </Link>
      ))}
    </div>
  );
} 