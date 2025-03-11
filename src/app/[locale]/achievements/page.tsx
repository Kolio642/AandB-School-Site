import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';

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

export default function AchievementsPage({ params }: AchievementsPageProps) {
  const { locale } = params;
  
  // Sample achievements data
  const achievements = locale === 'en' ? [
    {
      year: '2023',
      competitions: [
        {
          name: 'National Olympiad in Informatics',
          results: '2 gold medals, 1 silver medal, 3 bronze medals'
        },
        {
          name: 'International Olympiad in Informatics',
          results: '1 silver medal'
        },
        {
          name: 'National Tournament in Mathematics',
          results: '3 gold medals, 2 silver medals, 5 bronze medals'
        }
      ]
    },
    {
      year: '2022',
      competitions: [
        {
          name: 'National Olympiad in Informatics',
          results: '1 gold medal, 2 silver medals, 4 bronze medals'
        },
        {
          name: 'Balkan Olympiad in Informatics',
          results: '1 bronze medal'
        },
        {
          name: 'National Tournament in Mathematics',
          results: '2 gold medals, 4 silver medals, 3 bronze medals'
        }
      ]
    }
  ] : [
    {
      year: '2023',
      competitions: [
        {
          name: 'Национална олимпиада по информатика',
          results: '2 златни медала, 1 сребърен медал, 3 бронзови медала'
        },
        {
          name: 'Международна олимпиада по информатика',
          results: '1 сребърен медал'
        },
        {
          name: 'Национален турнир по математика',
          results: '3 златни медала, 2 сребърни медала, 5 бронзови медала'
        }
      ]
    },
    {
      year: '2022',
      competitions: [
        {
          name: 'Национална олимпиада по информатика',
          results: '1 златен медал, 2 сребърни медала, 4 бронзови медала'
        },
        {
          name: 'Балканска олимпиада по информатика',
          results: '1 бронзов медал'
        },
        {
          name: 'Национален турнир по математика',
          results: '2 златни медала, 4 сребърни медала, 3 бронзови медала'
        }
      ]
    }
  ];
  
  return (
    <main className="py-10">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            {locale === 'en' ? 'Student Achievements' : 'Ученически постижения'}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            {locale === 'en' 
              ? 'Our students regularly participate in and win awards at national and international competitions in mathematics and informatics.' 
              : 'Нашите ученици редовно участват и печелят награди на национални и международни състезания по математика и информатика.'}
          </p>
          
          <div className="space-y-10">
            {achievements.map((achievement) => (
              <div key={achievement.year} className="border rounded-lg p-6 bg-card">
                <h2 className="text-2xl font-bold mb-4">{achievement.year}</h2>
                <div className="space-y-4">
                  {achievement.competitions.map((competition, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <h3 className="font-semibold text-xl">{competition.name}</h3>
                      <p className="text-muted-foreground">{competition.results}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 