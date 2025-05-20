import { Metadata } from 'next';
import { Locale, locales, getTranslations } from '@/lib/i18n';
import { getTeachers } from '@/lib/database';
import { TeacherCard } from '@/components/teacher-card';

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

export default async function TeachersPage({ params }: TeachersPageProps) {
  const { locale } = params;
  const t = getTranslations(locale);
  const teachers = await getTeachers();
  
  return (
    <main>
      <div className="bg-primary-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">{t.teachers.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              {t.teachers.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              locale={locale}
            />
          ))}
        </div>
      </div>
    </main>
  );
} 