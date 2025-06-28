import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';
import { getAllAchievements } from '@/data/achievements';
import { Medal, Calendar, User, Tag, ChevronRight, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    title: locale === 'en' ? 'Achievements - A&B School' : 'Постижения - Школа A&B',
    description: locale === 'en' 
      ? 'Explore the achievements of A&B School students in mathematics and informatics competitions' 
      : 'Разгледайте постиженията на учениците на Школа A&B в състезания по математика и информатика'
  };
}

export default async function AchievementsPage({ params }: AchievementsPageProps) {
  const { locale } = params;
  const isEN = locale === 'en';
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
        {/* Header section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Award className="h-4 w-4 mr-2" />
            {isEN ? 'A&B School Achievements' : 'Постижения на Школа А&Б'}
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {isEN ? 'Student Achievements' : 'Ученически постижения'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isEN 
              ? 'Our students regularly participate in and win awards at national and international competitions' 
              : 'Нашите ученици редовно участват и печелят награди на национални и международни състезания'}
          </p>
        </div>

        {/* Achievements by Year */}
        {sortedYears.map((year) => (
          <div key={year} className="mb-16">
            <div className="flex items-center mb-8">
              <h2 className="text-3xl font-bold">{year}</h2>
              <div className="ml-4 h-0.5 flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {achievementsByYear[year].map((achievement, index) => {
                const translation = achievement.translations[locale];
                const formattedDate = formatDate(
                  new Date(achievement.date), 
                  isEN ? 'en-US' : 'bg-BG'
                );
                
                // Make the first item in each year a featured item
                const isFeature = index === 0;
                
                return (
                  <div 
                    key={achievement.id}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 bg-card hover:shadow-md transition-all duration-300",
                      isFeature ? "lg:col-span-2 lg:flex-row" : ""
                    )}
                  >
                    <div className={cn(
                      "relative overflow-hidden",
                      isFeature ? "lg:w-1/2 h-60 lg:h-auto" : "h-48"
                    )}>
                      {achievement.image ? (
                        <Image
                          src={achievement.image}
                          alt={translation.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-primary/30 to-primary/10 flex items-center justify-center">
                          <Medal className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                      <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 text-primary px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formattedDate}
                      </div>
                      {achievement.category && (
                        <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                          {achievement.category}
                        </div>
                      )}
                    </div>
                    
                    <div className={cn(
                      "flex flex-col gap-2 p-5",
                      isFeature ? "lg:w-1/2" : ""
                    )}>
                      <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300 flex items-center">
                        {translation.title}
                        <ChevronRight className="h-4 w-4 ml-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      
                      {achievement.student_name && (
                        <div className="flex items-center text-muted-foreground text-sm">
                          <User className="h-4 w-4 mr-1" />
                          <span>{achievement.student_name}</span>
                        </div>
                      )}
                      
                      <div 
                        className="prose prose-sm max-w-none text-muted-foreground mt-2 line-clamp-3"
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
          <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-gray-800 rounded-xl">
            <Medal className="h-12 w-12 text-primary/40 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isEN ? 'No Achievements Available' : 'Няма налични постижения'}
            </h2>
            <p className="text-muted-foreground max-w-md">
              {isEN 
                ? 'Check back soon for student achievements from A&B School' 
                : 'Проверете скоро за постижения на учениците от Школа А&Б'}
            </p>
          </div>
        )}
      </div>
    </main>
  );
} 