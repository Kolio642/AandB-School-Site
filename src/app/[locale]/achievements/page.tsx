import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { getAllAchievements } from '@/data/achievements';

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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            {locale === 'en' ? 'Student Achievements' : 'Ученически постижения'}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            {locale === 'en' 
              ? 'Our students regularly participate in and win awards at national and international competitions in mathematics and informatics.' 
              : 'Нашите ученици редовно участват и печелят награди на национални и международни състезания по математика и информатика.'}
          </p>
          
          <div className="space-y-12">
            {sortedYears.map((year) => (
              <div key={year} className="border rounded-lg p-6 bg-card">
                <h2 className="text-2xl font-bold mb-6">{year}</h2>
                <div className="space-y-8">
                  {achievementsByYear[year].map((achievement) => {
                    const translation = achievement.translations[locale];
                    const formattedDate = formatDate(
                      new Date(achievement.date), 
                      locale === 'en' ? 'en-US' : 'bg-BG'
                    );
                    
                    return (
                      <div key={achievement.id} className="flex flex-col md:flex-row gap-6 pb-8 border-b last:border-b-0 last:pb-0">
                        {achievement.image && (
                          <div className="relative w-full md:w-64 h-48 overflow-hidden rounded-md">
                            <Image
                              src={achievement.image}
                              alt={translation.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{translation.title}</h3>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-sm">
                            <div className="text-muted-foreground">
                              <span className="font-medium">{formattedDate}</span>
                            </div>
                            
                            {achievement.student_name && (
                              <div className="text-muted-foreground">
                                <span className="font-medium">{achievement.student_name}</span>
                              </div>
                            )}
                            
                            <div className="text-muted-foreground">
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800">
                                {achievement.category}
                              </span>
                            </div>
                          </div>
                          
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: translation.description }}
                          />
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
      </div>
    </main>
  );
} 