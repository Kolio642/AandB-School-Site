'use client';

import Image from 'next/image';
import { Teacher } from '@/lib/database';
import { Locale } from '@/lib/i18n';
import { Mail } from 'lucide-react';

interface TeacherCardProps {
  teacher: Teacher;
  locale: Locale;
}

export function TeacherCard({ teacher, locale }: TeacherCardProps) {
  const isEnglish = locale === 'en';
  const title = isEnglish ? teacher.title_en : teacher.title_bg;
  const bio = isEnglish ? teacher.bio_en : teacher.bio_bg;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-64 w-full overflow-hidden">
        {teacher.image ? (
          <Image
            src={teacher.image}
            alt={teacher.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-400 dark:text-gray-500 text-4xl font-bold">{teacher.name.charAt(0)}</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-1">{teacher.name}</h3>
        <p className="text-sm text-primary font-medium mb-3">{title}</p>
        
        <div className="prose prose-sm dark:prose-invert mb-4">
          <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{bio}</p>
        </div>
        
        {teacher.email && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <a 
              href={`mailto:${teacher.email}`} 
              className="inline-flex items-center text-sm text-primary hover:text-primary-600 transition-colors"
            >
              <Mail className="h-4 w-4 mr-2" />
              {teacher.email}
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 