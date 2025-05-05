'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  params?: {
    locale: Locale;
  };
}

export default function Error({ error, reset, params }: ErrorProps) {
  const locale = params?.locale || 'en';

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Route error:', error);
  }, [error]);

  const translations = {
    en: {
      title: 'Something went wrong',
      description: 'Sorry, an unexpected error has occurred.',
      tryAgain: 'Try again',
      backHome: 'Go back home'
    },
    bg: {
      title: 'Нещо се обърка',
      description: 'Съжаляваме, възникна неочаквана грешка.',
      tryAgain: 'Опитайте отново',
      backHome: 'Към началната страница'
    }
  };

  const t = translations[locale];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <div className="max-w-md p-6 bg-background rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-red-600">{t.title}</h2>
        <p className="text-muted-foreground">{t.description}</p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            {t.tryAgain}
          </button>
          <Link
            href={`/${locale}`}
            className="px-4 py-2 border border-input bg-background hover:bg-muted rounded-md transition-colors"
          >
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
} 