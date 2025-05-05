import { Metadata } from 'next';
import { Locale, locales, getTranslations } from '@/lib/i18n';
import { TeachersSection } from '@/components/sections/teachers-section';

interface TeachersPageProps {
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

export function generateMetadata({ params }: TeachersPageProps): Metadata {
  const locale = params.locale;
  const t = getTranslations(locale);
  
  return {
    title: t.teachers.meta.title,
    description: t.teachers.meta.description,
  };
}

export default function TeachersPage({ params }: TeachersPageProps) {
  const { locale } = params;
  const t = getTranslations(locale);
  
  return (
    <main>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">{t.teachers.title}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t.teachers.subtitle}
          </p>
        </div>
      </div>
      
      <TeachersSection 
        locale={locale}
      />
    </main>
  );
} 