import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getLatestNews, NewsItem } from '@/lib/data';

interface NewsSectionProps {
  locale: Locale;
}

interface NewsCardProps {
  item: NewsItem;
  locale: Locale;
}

function NewsCard({ item, locale }: NewsCardProps) {
  // Ensure we have a translation, or use a fallback
  const fallbackTranslation = {
    title: locale === 'en' ? 'News Item' : 'Новина',
    summary: locale === 'en' ? 'No summary available' : 'Няма налично резюме'
  };
  
  const translation = item.translations && item.translations[locale] 
    ? item.translations[locale] 
    : fallbackTranslation;
    
  const formattedDate = formatDate(new Date(item.date), locale === 'en' ? 'en-US' : 'bg-BG');
  
  return (
    <div className="flex flex-col overflow-hidden rounded-lg shadow-md bg-card">
      {item.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image 
            src={item.image}
            alt={translation.title || 'News image'}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-col gap-2 p-6">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
        <h3 className="text-xl font-semibold line-clamp-2">{translation.title}</h3>
        <p className="mt-2 text-muted-foreground line-clamp-3">{translation.summary}</p>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm">
            <Link href={`/${locale}/news/${item.id}`}>
              {locale === 'en' ? 'Read More' : 'Прочетете повече'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NewsSectionClientProps extends NewsSectionProps {
  news: NewsItem[];
}

function NewsSectionClient({ locale, news }: NewsSectionClientProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
            {locale === 'en' ? 'Latest News' : 'Последни новини'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {locale === 'en' 
              ? 'Stay updated with the latest events and achievements at School A&B' 
              : 'Бъдете в крак с последните събития и постижения в Школа А&Б'}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button asChild>
            <Link href={`/${locale}/news`}>
              {locale === 'en' ? 'View All News' : 'Вижте всички новини'}
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