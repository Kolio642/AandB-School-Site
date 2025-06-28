import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getLatestNews, NewsItem } from '@/data/news';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsSectionProps {
  locale: Locale;
}

interface NewsCardProps {
  item: NewsItem;
  locale: Locale;
  index: number;
}

function NewsCard({ item, locale, index }: NewsCardProps) {
  // Ensure we have a translation, or use a fallback
  const fallbackTranslation = {
    title: locale === 'en' ? 'News Item' : 'Новина',
    summary: locale === 'en' ? 'No summary available' : 'Няма налично резюме'
  };
  
  const translation = item.translations && item.translations[locale] 
    ? item.translations[locale] 
    : fallbackTranslation;
    
  const formattedDate = formatDate(new Date(item.date), locale === 'en' ? 'en-US' : 'bg-BG');
  
  // Apply different styles based on the index
  const isFeature = index === 0;

  return (
    <div 
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 bg-card hover:shadow-md transition-all duration-300",
        isFeature ? "md:col-span-2 md:flex-row" : ""
      )}
    >
      <div className={cn(
        "relative overflow-hidden",
        isFeature ? "md:w-1/2 h-60 md:h-auto" : "h-48"
      )}>
        {item.image ? (
          <Image 
            src={item.image}
            alt={translation.title || 'News image'}
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
        isFeature ? "md:w-1/2" : ""
      )}>
        <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {translation.title}
        </h3>
        <p className="mt-2 text-muted-foreground line-clamp-3">
          {translation.summary}
        </p>
        <div className="mt-auto pt-4">
          <Button asChild variant="outline" size="sm" className="group/btn">
            <Link href={`/${locale}/news/${item.id}`} className="flex items-center">
              {locale === 'en' ? 'Read More' : 'Прочетете повече'}
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function NewsSectionClient({ locale, news }: { locale: Locale, news: NewsItem[] }) {
  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-gray-900">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Newspaper className="h-4 w-4 mr-2" />
            {locale === 'en' ? 'Latest Updates' : 'Последни новини'}
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            {locale === 'en' ? 'School News & Events' : 'Новини и събития'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {locale === 'en' 
              ? 'Stay updated with the latest events and achievements at School A&B' 
              : 'Бъдете в крак с последните събития и постижения в Школа А&Б'}
          </p>
        </div>
        
        {/* Responsive grid - 2 columns by default, first item spans 2 columns on md+ */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item, index) => (
            <NewsCard 
              key={item.id} 
              item={item} 
              locale={locale} 
              index={index}
            />
          ))}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Button asChild className="group">
            <Link href={`/${locale}/news`} className="flex items-center">
              {locale === 'en' ? 'View All News' : 'Вижте всички новини'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export async function NewsSection({ locale }: NewsSectionProps) {
  const latestNews = await getLatestNews(3);
  
  return <NewsSectionClient locale={locale} news={latestNews} />;
} 