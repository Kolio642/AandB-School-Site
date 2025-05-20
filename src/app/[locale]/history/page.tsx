import { Metadata } from 'next';
import { Locale, locales, getTranslations } from '@/lib/i18n';
import Image from 'next/image';

interface HistoryPageProps {
  params: {
    locale: Locale;
  };
}

// This function is required when using static export with dynamic routes
export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export function generateMetadata({ params }: HistoryPageProps): Metadata {
  const locale = params.locale;
  const t = getTranslations(locale);
  
  return {
    title: t.history.meta.title,
    description: t.history.meta.description,
  };
}

export default function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = params;
  const t = getTranslations(locale);
  
  // History sections with content from translations
  const historySections = [
    {
      id: 'founding',
      title: t.history.founding.title,
      content: t.history.founding.content,
      image: '/images/history/founding.jpg',
    },
    {
      id: 'development',
      title: t.history.development.title,
      content: t.history.development.content,
      image: '/images/history/development.jpg',
    },
    {
      id: 'achievements',
      title: t.history.achievements.title,
      content: t.history.achievements.content,
      image: '/images/history/achievements.jpg',
    },
    {
      id: 'vision',
      title: t.history.vision.title,
      content: t.history.vision.content,
      image: '/images/history/vision.jpg',
    },
  ];

  return (
    <main>
      <div className="bg-primary-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">{t.history.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t.history.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {historySections.map((section, index) => (
            <section 
              key={section.id}
              id={section.id}
              className={`mb-16 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                  <div className="prose prose-lg dark:prose-invert">
                    <p>{section.content}</p>
                  </div>
                </div>
                
                <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="relative h-64 w-full">
                    {/* Add actual images when available */}
                    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-lg">
                        {section.title}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
} 