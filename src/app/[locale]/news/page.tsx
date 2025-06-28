import { Locale, locales } from '@/lib/i18n';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getAllNews } from '@/data/news';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Calendar, ArrowRight, Newspaper, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsPageProps {
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

export function generateMetadata({ params }: NewsPageProps): Metadata {
  const locale = params.locale;
  return {
    title: locale === 'en' ? 'News - A&B School' : 'Новини - Школа A&B',
    description: locale === 'en' 
      ? 'Stay updated with the latest news and events from A&B School of Mathematics and Informatics' 
      : 'Бъдете в крак с последните новини и събития от Школа A&B по математика и информатика'
  };
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { locale } = params;
  const isEN = locale === 'en';
  const news = await getAllNews();
  
  return (
    <main className="py-10">
      <div className="container">
        {/* Header section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Newspaper className="h-4 w-4 mr-2" />
            {isEN ? 'A&B School News' : 'Новини от Школа А&Б'}
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {isEN ? 'Latest News & Announcements' : 'Последни новини и съобщения'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {isEN 
              ? 'Stay updated with the latest developments, events, and successes at our school' 
              : 'Бъдете в крак с последните развития, събития и успехи в нашата школа'}
          </p>
        </div>

        {/* News grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.length > 0 ? (
            news.map((item, index) => {
              const translation = item.translations && item.translations[locale] 
                ? item.translations[locale] 
                : { 
                    title: isEN ? 'News Item' : 'Новина',
                    summary: isEN ? 'No summary available' : 'Няма налично резюме' 
                  };
              
              const formattedDate = formatDate(
                new Date(item.date), 
                isEN ? 'en-US' : 'bg-BG'
              );
              
              // Make the first item a featured item on larger screens
              const isFeature = index === 0;
              
              return (
                <div 
                  key={item.id}
                  className={cn(
                    "group flex flex-col overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 bg-card hover:shadow-md transition-all duration-300",
                    isFeature ? "lg:col-span-2 lg:flex-row" : ""
                  )}
                >
                  <div className={cn(
                    "relative overflow-hidden",
                    isFeature ? "lg:w-1/2 h-60 lg:h-auto" : "h-48"
                  )}>
                    {item.image ? (
                      <Image 
                        src={item.image}
                        alt={translation.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-primary/30 to-primary/10 flex items-center justify-center">
                        <Newspaper className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                    <div className="absolute bottom-3 left-3 bg-white dark:bg-gray-800 text-primary px-2 py-1 rounded-full text-xs font-medium flex items-center shadow-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formattedDate}
                    </div>
                  </div>
                  <div className={cn(
                    "flex flex-col gap-2 p-5",
                    isFeature ? "lg:w-1/2" : ""
                  )}>
                    <h2 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                      {translation.title}
                    </h2>
                    <p className="mt-2 text-muted-foreground line-clamp-3">
                      {translation.summary}
                    </p>
                    <div className="mt-auto pt-4">
                      <Button asChild variant="outline" size="sm" className="group/btn">
                        <Link href={`/${locale}/news/${item.id}`} className="flex items-center">
                          {isEN ? 'Read More' : 'Прочетете повече'}
                          <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-gray-800 rounded-xl">
              <Newspaper className="h-12 w-12 text-primary/40 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isEN ? 'No News Available' : 'Няма налични новини'}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {isEN 
                  ? 'Check back soon for the latest news and announcements from A&B School' 
                  : 'Проверете скоро за последните новини и съобщения от Школа А&Б'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 