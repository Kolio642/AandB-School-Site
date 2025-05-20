import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAchievementById, getAllAchievements } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { notFound } from 'next/navigation';
import ImageWithFallback from '@/components/ui/image-with-fallback';

interface AchievementDetailPageProps {
  params: {
    locale: Locale;
    id: string;
  };
}

// This function is required when using static export with dynamic routes
export async function generateStaticParams() {
  const achievements = await getAllAchievements();
  
  // Generate all combinations of locale and achievement id
  const params = [];
  
  for (const locale of locales) {
    for (const achievement of achievements) {
      if (achievement) {
        params.push({
          locale,
          id: achievement.id
        });
      }
    }
  }
  
  return params;
}

export async function generateMetadata({ params }: AchievementDetailPageProps): Promise<Metadata> {
  const { locale, id } = params;
  const achievement = await getAchievementById(id);
  
  if (!achievement) {
    return {
      title: locale === 'en' ? 'Achievement Not Found' : 'Постижение не е намерено',
    };
  }
  
  // Make sure translation exists, provide fallbacks if not
  const translation = achievement.translations?.[locale] || {
    title: locale === 'en' ? 'Untitled' : 'Без заглавие',
    description: locale === 'en' ? 'No description available' : 'Няма налично описание'
  };
  
  return {
    title: translation.title,
    description: translation.description
  };
}

export default async function AchievementDetailPage({ params }: AchievementDetailPageProps) {
  const { locale, id } = params;
  const achievement = await getAchievementById(id);
  
  if (!achievement) {
    notFound();
  }
  
  // Make sure translation exists, provide fallbacks if not
  const translation = achievement.translations?.[locale] || {
    title: locale === 'en' ? 'Untitled' : 'Без заглавие',
    description: locale === 'en' ? 'No description available' : 'Няма налично описание'
  };
  
  // Format date with a fallback
  const formattedDate = achievement.date 
    ? formatDate(new Date(achievement.date), locale === 'en' ? 'en-US' : 'bg-BG')
    : locale === 'en' ? 'Unknown date' : 'Неизвестна дата';
  
  return (
    <main className="py-10">
      <div className="container">
        <Button asChild variant="ghost" className="mb-6">
          <Link href={`/${locale}/achievements`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {locale === 'en' ? 'Back to Achievements' : 'Обратно към постиженията'}
          </Link>
        </Button>
        
        <article className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {translation.title}
          </h1>
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-6 text-muted-foreground">
            <div>
              <span>{formattedDate}</span>
            </div>
            
            {achievement.student_name && (
              <div>
                <span className="font-medium">{achievement.student_name}</span>
              </div>
            )}
            
            <div>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                {achievement.category}
              </span>
            </div>
          </div>
          
          {achievement.image && (
            <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden" style={{position: 'relative'}}>
              <ImageWithFallback 
                src={achievement.image}
                alt={translation.title || ''}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div 
            className="prose prose-lg max-w-none dark:prose-invert" 
            dangerouslySetInnerHTML={{ __html: translation.description }}
          />
        </article>
      </div>
    </main>
  );
} 