import Link from 'next/link';
import { Locale, getTranslations } from '@/lib/i18n';
import { MapPin, Phone, Mail } from 'lucide-react';
import { memo } from 'react';

interface FooterProps {
  locale: Locale;
}

interface ContactInfo {
  icon: JSX.Element;
  content: JSX.Element | string;
}

interface FooterLink {
  href: string;
  label: string;
}

/**
 * Application footer with contact information and links
 * 
 * @param locale - The current active locale
 */
export const Footer = memo(function Footer({ locale }: FooterProps) {
  try {
    const t = getTranslations(locale);
    const currentYear = new Date().getFullYear();
    
    // Contact information with icons
    const contactInfo: ContactInfo[] = [
      {
        icon: <MapPin className="h-5 w-5 mr-2 mt-0.5 text-primary" aria-hidden="true" />,
        content: t.footer.address
      },
      {
        icon: <Phone className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />,
        content: t.footer.phone
      },
      {
        icon: <Mail className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />,
        content: (
          <a 
            href="mailto:info@ab-bg.com" 
            className="hover:text-primary transition-colors"
            aria-label="Email us at info@ab-bg.com"
          >
            info@ab-bg.com
          </a>
        )
      }
    ];
    
    // Footer links for navigation
    const footerLinks: FooterLink[] = [
      {
        href: `/${locale}/history`,
        label: t.nav.history
      },
      {
        href: `/${locale}/teachers`,
        label: t.nav.team
      },
      {
        href: `/${locale}/achievements`,
        label: t.nav.achievements
      },
      {
        href: `/${locale}/contacts`,
        label: t.nav.contacts
      }
    ];
    
    return (
      <footer className="bg-primary-50 dark:bg-gray-900" role="contentinfo">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-bold mb-4">{t.site.name}</h3>
              <p className="text-muted-foreground mb-4">
                {t.site.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">{t.nav.contacts}</h3>
              <ul className="space-y-3" aria-label="Contact information">
                {contactInfo.map((item, index) => (
                  <li key={index} className="flex items-start">
                    {item.icon}
                    <span>{item.content}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">{t.footer.quickLinks}</h3>
              <nav aria-label="Footer navigation">
                <ul className="space-y-2">
                  {footerLinks.map((link) => (
                    <li key={link.href}>
                      <Link 
                        href={link.href} 
                        className="hover:text-primary transition-colors"
                        aria-label={link.label}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
          
          <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
            <p>{t.footer.copyright.replace('2024', currentYear.toString())}</p>
          </div>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('Error rendering Footer:', error);
    // Return minimal footer as fallback
    return (
      <footer className="bg-primary-50 dark:bg-gray-900 py-4 text-center">
        <div className="container">
          <p>© {new Date().getFullYear()} Школа A&B | All rights reserved</p>
        </div>
      </footer>
    );
  }
}); 