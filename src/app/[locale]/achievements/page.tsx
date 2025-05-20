import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { getAllAchievements } from '@/lib/data';
import { Button } from '@/components/ui/button';
import ImageWithFallback from '@/components/ui/image-with-fallback';

interface AchievementsPageProps {
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

export function generateMetadata({ params }: AchievementsPageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'Achievements - A&B School' : 'Постижения - Школа А&Б',
    description: locale === 'en' 
      ? 'Discover the achievements and awards earned by A&B School students' 
      : 'Открийте постиженията и наградите, спечелени от учениците на Школа А&Б'
  };
}

export default async function AchievementsPage({ params }: AchievementsPageProps) {
  const { locale } = params;
  const achievements = await getAllAchievements();
  
  // Group achievements by year
  const achievementsByYear = achievements.reduce((groups, achievement) => {
    const year = new Date(achievement.date).getFullYear().toString();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(achievement);
    return groups;
  }, {} as Record<string, typeof achievements>);
  
  // Sort years in descending order
  const sortedYears = Object.keys(achievementsByYear).sort((a, b) => parseInt(b) - parseInt(a));
  
  return (
    <main className="py-10">
      <div className="container">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'en' ? 'Student Achievements' : 'Ученически постижения'}
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            {locale === 'en' 
              ? 'Our students regularly participate in and win awards at national and international competitions in mathematics and informatics.' 
              : 'Нашите ученици редовно участват и печелят награди на национални и международни състезания по математика и информатика.'}
          </p>
        </div>
        
        <div className="space-y-16">
          {sortedYears.map((year) => (
            <div key={year}>
              <h2 className="text-2xl font-bold mb-8 border-b pb-2">{year}</h2>
              
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {achievementsByYear[year].map((achievement) => {
                  const translation = achievement.translations[locale];
                  const formattedDate = formatDate(
                    new Date(achievement.date), 
                    locale === 'en' ? 'en-US' : 'bg-BG'
                  );
                  
                  return (
                    <div key={achievement.id} className="flex flex-col overflow-hidden rounded-lg shadow-md bg-card">
                      <div className="relative h-48 w-full" style={{position: 'relative'}}>
                        <ImageWithFallback 
                          src={achievement.image || '/placeholder.jpg'}
                          alt={translation.title}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-2 p-6">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
                          <p className="text-sm text-muted-foreground">{formattedDate}</p>
                          
                          <div className="text-sm">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                              {achievement.category}
                            </span>
                          </div>
                        </div>
                        
                        {achievement.student_name && (
                          <p className="text-sm font-medium text-muted-foreground">
                            {achievement.student_name}
                          </p>
                        )}
                        
                        <h3 className="text-xl font-semibold line-clamp-2">{translation.title}</h3>
                        
                        <div className="mt-auto pt-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/${locale}/achievements/${achievement.id}`}>
                              {locale === 'en' ? 'View Details' : 'Вижте детайли'}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {sortedYears.length === 0 && (
            <div className="text-center p-8 border rounded-lg">
              <h3 className="text-xl font-semibold">
                {locale === 'en' ? 'No achievements found' : 'Не са намерени постижения'}
              </h3>
              <p className="text-muted-foreground mt-2">
                {locale === 'en' 
                  ? 'Check back later for updates on our student achievements' 
                  : 'Проверете по-късно за обновления относно постиженията на нашите ученици'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 