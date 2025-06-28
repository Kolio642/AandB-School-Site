import Image from 'next/image';
import { Teacher } from '@/data/teachers';
import { Locale } from '@/lib/i18n';

interface TeacherCardProps {
  teacher: Teacher;
  locale: Locale;
}

export function TeacherCard({ teacher, locale }: TeacherCardProps) {
  const translation = teacher.translations[locale];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        {teacher.image ? (
          <Image
            src={teacher.image}
            alt={teacher.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-xl">{teacher.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{teacher.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{translation.title}</p>
        {teacher.email && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            <a href={`mailto:${teacher.email}`} className="hover:underline">
              {teacher.email}
            </a>
          </p>
        )}
        <div className="prose prose-sm dark:prose-invert mt-4">
          <p className="text-gray-700 dark:text-gray-300 text-sm">{translation.bio}</p>
        </div>
      </div>
    </div>
  );
} 