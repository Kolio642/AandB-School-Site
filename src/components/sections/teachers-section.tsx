import { getTeachers } from '@/lib/database';
import { TeacherCard } from '@/components/teacher-card';
import { Locale } from '@/lib/i18n';

interface TeachersSectionProps {
  locale: Locale;
  title?: string;
  subtitle?: string;
}

export async function TeachersSection({ locale, title, subtitle }: TeachersSectionProps) {
  const teachers = await getTeachers(true);
  
  if (teachers.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl font-bold mb-4">{title}</h2>}
            {subtitle && <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}
        
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
    </section>
  );
} 