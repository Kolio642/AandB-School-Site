import Link from 'next/link';
import Image from 'next/image';
import { Locale } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getLatestNews, NewsItem } from '@/lib/data';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface NewsSectionProps {
  locale: Locale;
}

interface NewsCardProps {
  item: NewsItem;
  locale: Locale;
}

function NewsCard({ item, locale }: NewsCardProps) {
  // Make sure the translations exist
  const translation = item.translations?.[locale] || {
    title: locale === 'en' ? 'Untitled' : 'Без заглавие',
    summary: locale === 'en' ? 'No summary available' : 'Няма налично резюме',
    content: ''
  };
  
  // Format the date
  const formattedDate = item.date 
    ? formatDate(new Date(item.date), locale === 'en' ? 'en-US' : 'bg-BG')
    : locale === 'en' ? 'Unknown date' : 'Неизвестна дата';
  
  return (
    <div className="flex flex-col rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg bg-card">
      <div className="relative h-48 w-full" style={{position: 'relative'}}>
        <Image
          src={item.image || "/placeholder.jpg"}
          alt={translation.title}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2 p-6">
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
        <h3 className="text-xl font-semibold line-clamp-2">{translation.title}</h3>
        <p className="mt-1 text-muted-foreground line-clamp-3">{translation.summary}</p>
        <div className="mt-auto pt-4">
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
  error: string | null;
}

function NewsSectionClient({ locale, news, error }: NewsSectionClientProps) {
  // Handle error state
  if (error) {
    return (
      <section className="py-16">
        <div className="container">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {locale === 'en' ? 'Error' : 'Грешка'}
            </AlertTitle>
            <AlertDescription>
              {locale === 'en' 
                ? 'Failed to load latest news. Please try again later.' 
                : 'Грешка при зареждане на последните новини. Моля, опитайте отново по-късно.'}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }
  
  // Handle empty news state
  if (news.length === 0) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              {locale === 'en' ? 'Latest News' : 'Последни новини'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {locale === 'en' 
                ? 'No news available at the moment.' 
                : 'В момента няма налични новини.'}
            </p>
          </div>
        </div>
      </section>
    );
  }
  
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
  const { data: newsItems, error } = await getLatestNews(3);
  
  return <NewsSectionClient locale={locale} news={newsItems} error={error} />;
} 