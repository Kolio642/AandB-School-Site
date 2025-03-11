import { Locale, getTranslations, isValidLocale, locales } from '@/lib/i18n';
import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ErrorBoundary } from '@/components/error-boundary';

/**
 * Generate static paths for all locales
 * This is required when using output: 'export' with dynamic routes
 */
export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

/**
 * Generates metadata for the page based on the locale
 * 
 * @param params - Object containing the locale parameter
 * @returns Metadata for the page
 */
export async function generateMetadata({ 
  params 
}: { 
  params: { locale: Locale } 
}): Promise<Metadata> {
  try {
    const locale = params.locale;
    
    // Validate that we have a supported locale
    if (!isValidLocale(locale)) {
      console.warn(`Invalid locale in params: ${locale}`);
    }
    
    const title = locale === 'en' ? 'A&B School' : 'Школа A&B';
    const description = locale === 'en' 
      ? 'School of Mathematics and Informatics A&B - Shumen' 
      : 'Школа за математика и информатика A&B - Шумен';

    return {
      title: {
        default: title,
        template: `%s | ${title}`,
      },
      description,
      icons: {
        icon: '/favicon.ico',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Return minimal metadata as fallback
    return {
      title: 'A&B School',
      description: 'School of Mathematics and Informatics'
    };
  }
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

/**
 * Layout component for locale-specific pages
 * 
 * @param children - Child components to render
 * @param params - Route parameters including locale
 * @returns The locale-specific layout
 */
export default function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  try {
    const { locale } = params;
    
    // Log the locale being loaded
    console.log(`Rendering page with locale: ${locale}`);
    
    return (
      <ErrorBoundary fallback={<div className="p-4">Something went wrong. Please try again later.</div>}>
        <>
          <Header locale={locale} />
          <main className="flex-1">
            {children}
          </main>
          <Footer locale={locale} />
        </>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error in LocaleLayout:', error);
    
    // Return minimal UI in case of error
    return (
      <div className="flex flex-col min-h-screen">
        <header className="p-4 border-b">
          <h1 className="text-xl font-bold">A&B School</h1>
        </header>
        <main className="flex-1 p-4">
          <div className="p-4 border rounded bg-red-50 text-red-800">
            An error occurred while loading the page. Please try refreshing.
          </div>
        </main>
        <footer className="p-4 border-t text-center">
          © {new Date().getFullYear()} A&B School
        </footer>
      </div>
    );
  }
} 