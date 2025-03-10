import Link from 'next/link';
import { Locale, getTranslations } from '@/lib/i18n';
import { LanguageSwitcher } from './language-switcher';
import { MobileMenu } from './mobile-menu';
import { memo } from 'react';

interface HeaderProps {
  locale: Locale;
}

interface NavItem {
  href: string;
  label: string;
}

/**
 * Application header with navigation and language switcher
 * 
 * @param locale - The current active locale
 */
export const Header = memo(function Header({ locale }: HeaderProps) {
  const t = getTranslations(locale);
  
  // Generate navigation items based on the current locale
  const navItems: NavItem[] = [
    {
      href: `/${locale}`,
      label: locale === 'en' ? 'Home' : 'Начало'
    },
    {
      href: `/${locale}/about`,
      label: locale === 'en' ? 'About' : 'За нас'
    },
    {
      href: `/${locale}/education`,
      label: locale === 'en' ? 'Education' : 'Обучение'
    },
    {
      href: `/${locale}/achievements`,
      label: locale === 'en' ? 'Achievements' : 'Постижения'
    },
    {
      href: `/${locale}/news`,
      label: locale === 'en' ? 'News' : 'Новини'
    },
    {
      href: `/${locale}/contacts`,
      label: locale === 'en' ? 'Contacts' : 'Контакти'
    }
  ];

  return (
    <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="banner">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <span className="inline-block font-bold text-2xl">
              {locale === 'en' ? 'A&B School' : 'Школа A&B'}
            </span>
          </Link>
          <nav className="hidden md:flex gap-6" aria-label="Main Navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center text-lg font-medium transition-colors hover:text-primary"
                aria-current={item.href === `/${locale}` ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} />
          <div className="block md:hidden">
            <MobileMenu locale={locale} navItems={navItems} />
          </div>
        </div>
      </div>
    </header>
  );
}); 