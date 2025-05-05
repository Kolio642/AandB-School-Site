import Link from 'next/link';
import { Locale, getTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';

/**
 * Interface for navigation items
 */
interface NavItem {
  href: string;
  label: string;
}

interface HeaderProps {
  locale: Locale;
}

/**
 * Header component that provides navigation for the site
 * 
 * @param locale - The current locale
 */
export function Header({ locale }: HeaderProps) {
  const t = getTranslations(locale);
  
  // Navigation items based on translations
  const navItems: NavItem[] = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/about`, label: t.nav.about },
    { href: `/${locale}/education`, label: t.nav.education },
    { href: `/${locale}/achievements`, label: t.nav.achievements },
    { href: `/${locale}/news`, label: t.nav.news },
    { href: `/${locale}/contacts`, label: t.nav.contacts },
  ];
  
  // Testimonial for mobile menu
  const testimonial = {
    quote: locale === 'en' 
      ? 'The curriculum at A&B prepared me exceptionally well for university. I developed critical thinking skills that have been invaluable in my career.' 
      : 'Учебната програма в А&B ме подготви изключително добре за университета. Развих умения за критично мислене, които са безценни в моята кариера.',
    author: locale === 'en' ? 'Elena Petrova' : 'Елена Петрова',
    role: locale === 'en' ? 'Alumni 2019' : 'Випуск 2019'
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link 
            href={`/${locale}`} 
            className="flex items-center gap-2 mr-4 text-xl font-bold" 
            aria-label={locale === 'en' ? 'A&B School' : 'Школа A&B'}
          >
            {locale === 'en' ? 'A&B School' : 'Школа A&B'}
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 mx-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:block">
            <LanguageSwitcher locale={locale} variant="default" />
          </div>
          <MobileMenu 
            locale={locale} 
            navItems={navItems} 
            testimonial={testimonial}
          />
        </div>
      </div>
    </header>
  );
} 