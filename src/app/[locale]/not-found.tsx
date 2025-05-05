import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface NotFoundProps {
  params?: {
    locale: Locale;
  };
}

export default function NotFound({ params }: NotFoundProps) {
  // Default to 'en' locale if params is undefined
  const locale = params?.locale || 'en';
  
  const translations = {
    en: {
      title: "Page Not Found",
      description: "Sorry, we couldn't find the page you're looking for.",
      backHome: "Back to Home",
      contact: "Contact Us"
    },
    bg: {
      title: "Страницата не е намерена",
      description: "Съжаляваме, но не можахме да намерим страницата, която търсите.",
      backHome: "Към началната страница",
      contact: "Свържете се с нас"
    }
  };
  
  const t = translations[locale];
  
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold">{t.title}</h2>
        <p className="text-muted-foreground">{t.description}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link 
            href={`/${locale}`}
            className="px-6 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
          >
            {t.backHome}
          </Link>
          <Link 
            href={`/${locale}/contacts`}
            className="px-6 py-2 rounded-md border border-input bg-background hover:bg-muted transition-colors"
          >
            {t.contact}
          </Link>
        </div>
      </div>
    </main>
  );
} 